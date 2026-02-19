import { Prisma, PrismaClient } from '@prisma/client'
import yahooFinance from 'yahoo-finance2'
import { Server as SocketIOServer } from 'socket.io'

const POLL_INTERVAL_MS = 10_000
const MAX_SYMBOLS_PER_USER = 50

function isPrismaMissingTableError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2021'
  )
}

function isTransientDbError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = err.message.toLowerCase()
  return (
    msg.includes('can\'t reach database server') ||
    msg.includes('could not connect') ||
    msg.includes('connection refused') ||
    msg.includes('econnrefused') ||
    msg.includes('terminating connection') ||
    msg.includes('the database system is starting up')
  )
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

export function startPricePolling(prisma: PrismaClient, io: SocketIOServer) {
  let running = false
  let consecutiveDbFailures = 0
  let loggedDbNotReady = false

  const tick = async () => {
    if (running) return
    running = true

    try {
      const list = await prisma.position.findMany({
        where: { sellDate: null },
        select: { userId: true, ticker: true },
      })

      consecutiveDbFailures = 0
      loggedDbNotReady = false

      const byUser = list.reduce<Record<number, string[]>>((acc, { userId, ticker }) => {
        ;(acc[userId] ??= []).push(ticker)
        return acc
      }, {})

      for (const [uidStr, tickers] of Object.entries(byUser)) {
        const uid = Number(uidStr)
        if (!Number.isFinite(uid)) continue

        const symbols = uniq(tickers).slice(0, MAX_SYMBOLS_PER_USER)
        if (symbols.length === 0) continue

        try {
          const quotes = await yahooFinance.quote(symbols)
          const data = Array.isArray(quotes) ? quotes : [quotes]

          io.to(`user_${uid}`).emit(
            'price:update',
            data
              .filter((q) => q?.symbol)
              .map((q) => ({
                symbol: q.symbol!,
                currentPrice: q.regularMarketPrice ?? null,
                dailyChangePercent: q.regularMarketChangePercent ?? null,
              }))
          )
        } catch (err) {
          console.error(`[pricePoller] quote fetch failed user=${uid} symbols=${symbols.join(',')}`, err)
        }
      }
    } catch (err) {
      consecutiveDbFailures += 1

      if (isPrismaMissingTableError(err)) {
        if (!loggedDbNotReady) {
          loggedDbNotReady = true
          console.warn('[pricePoller] DB schema not ready yet (missing table). Will retry.')
        }
        return
      }

      if (isTransientDbError(err)) {
        if (consecutiveDbFailures === 1 || consecutiveDbFailures % 6 === 0) {
          console.warn(`[pricePoller] DB not reachable yet. failures=${consecutiveDbFailures}. Will retry.`)
        }
        return
      }

      console.error('[pricePoller] unexpected failure', err)
    } finally {
      running = false
    }
  }

  void tick()
  setInterval(() => void tick(), POLL_INTERVAL_MS)
}
