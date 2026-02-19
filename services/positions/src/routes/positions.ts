import { Router } from 'express'
import type { PrismaClient } from '@prisma/client'
import type { Server as SocketIOServer } from 'socket.io'

export default function positionsRoutes(prisma: PrismaClient) {
  const router = Router()

  router.get('/', async (req, res, next) => {
    try {
      const userId = req.auth?.userId
      if (!userId) {
        res.status(401).json({ error: 'Invalid or missing token' })
        return
      }

      const status = (req.query.status as string) || 'open'
      const positions = await prisma.position.findMany({
        where: {
          userId,
          ...(status === 'open' ? { sellDate: null } : { sellDate: { not: null } }),
        },
        orderBy: { buyDate: 'desc' },
      })

      res.json(positions)
    } catch (err) {
      next(err)
    }
  })

  router.post('/', async (req, res, next) => {
    try {
      const userId = req.auth?.userId
      if (!userId) {
        res.status(401).json({ error: 'Invalid or missing token' })
        return
      }

      const { ticker, quantity, buyPrice, buyDate } = req.body as {
        ticker?: string
        quantity?: number | string
        buyPrice?: number | string
        buyDate?: string
      }

      if (!ticker || quantity == null || buyPrice == null) {
        res.status(400).json({ error: 'ticker, quantity and buyPrice are required' })
        return
      }

      const data: {
        userId: number
        ticker: string
        quantity: number
        buyPrice: number
        buyDate?: Date
      } = {
        userId,
        ticker,
        quantity: Number(quantity),
        buyPrice: Number(buyPrice),
      }

      if (buyDate) data.buyDate = new Date(buyDate)

      const position = await prisma.position.create({ data })

      const io: SocketIOServer = req.app.locals.io
      io.to(`user_${userId}`).emit('position:added', position)

      res.status(201).json(position)
    } catch (err) {
      next(err)
    }
  })

  router.put('/:id/close', async (req, res, next) => {
    try {
      const userId = req.auth?.userId
      if (!userId) {
        res.status(401).json({ error: 'Invalid or missing token' })
        return
      }

      const id = Number(req.params.id)
      const { sellPrice, sellDate } = req.body as { sellPrice?: number | string; sellDate?: string }

      if (sellPrice == null) {
        res.status(400).json({ error: 'sellPrice is required' })
        return
      }

      const existing = await prisma.position.findUnique({ where: { id } })
      if (!existing || existing.userId !== userId || existing.sellDate) {
        res.status(404).json({ error: 'Position not found or already closed' })
        return
      }

      const updated = await prisma.position.update({
        where: { id },
        data: {
          sellPrice: Number(sellPrice),
          sellDate: sellDate ? new Date(sellDate) : new Date(),
        },
      })

      const io: SocketIOServer = req.app.locals.io
      io.to(`user_${userId}`).emit('position:closed', updated)

      res.json(updated)
    } catch (err) {
      next(err)
    }
  })

  router.put('/:id', async (req, res, next) => {
    try {
      const userId = req.auth?.userId
      if (!userId) {
        res.status(401).json({ error: 'Invalid or missing token' })
        return
      }

      const id = Number(req.params.id)
      const { quantity, buyPrice, buyDate, sellPrice, sellDate } = req.body as {
        quantity?: number | string
        buyPrice?: number | string
        buyDate?: string
        sellPrice?: number | string
        sellDate?: string
      }

      if (quantity == null || buyPrice == null) {
        res.status(400).json({ error: 'quantity and buyPrice are required' })
        return
      }

      const existing = await prisma.position.findUnique({ where: { id } })
      if (!existing || existing.userId !== userId) {
        res.status(404).json({ error: 'Position not found' })
        return
      }

      const data: {
        quantity: number
        buyPrice: number
        buyDate?: Date
        sellPrice?: number
        sellDate?: Date
      } = {
        quantity: Number(quantity),
        buyPrice: Number(buyPrice),
      }

      if (buyDate) data.buyDate = new Date(buyDate)
      if (sellPrice != null) data.sellPrice = Number(sellPrice)
      if (sellDate) data.sellDate = new Date(sellDate)

      const updated = await prisma.position.update({ where: { id }, data })

      const io: SocketIOServer = req.app.locals.io
      io.to(`user_${userId}`).emit('position:updated', updated)

      res.json(updated)
    } catch (err) {
      next(err)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      const userId = req.auth?.userId
      if (!userId) {
        res.status(401).json({ error: 'Invalid or missing token' })
        return
      }

      const id = Number(req.params.id)

      const existing = await prisma.position.findUnique({ where: { id } })
      if (!existing || existing.userId !== userId) {
        res.status(404).json({ error: 'Position not found' })
        return
      }

      await prisma.position.delete({ where: { id } })

      const io: SocketIOServer = req.app.locals.io
      io.to(`user_${userId}`).emit('position:deleted', { id })

      res.status(204).end()
    } catch (err) {
      next(err)
    }
  })

  return router
}
