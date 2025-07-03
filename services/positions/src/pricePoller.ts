import { PrismaClient } from '@prisma/client';
import yahooFinance from 'yahoo-finance2';
import { Server as SocketIOServer } from 'socket.io';

export function startPricePolling(prisma: PrismaClient, io: SocketIOServer) {
  setInterval(async () => {
    const list = await prisma.position.findMany({
      where: { sellDate: null },
      select: { userId: true, ticker: true },
    });

    const byUser = list.reduce<Record<number, string[]>>((acc, { userId, ticker }) => {
      acc[userId] = acc[userId] || [];
      if (!acc[userId].includes(ticker)) acc[userId].push(ticker);
      return acc;
    }, {});

    for (const [uid, symbols] of Object.entries(byUser)) {
      try {
        const quotes = await yahooFinance.quote(symbols);
        const data = Array.isArray(quotes) ? quotes : [quotes];

        io.to(`user_${uid}`).emit(
          'price:update',
          data.map(q => ({
            symbol: q.symbol,
            currentPrice: q.regularMarketPrice,
            dailyChangePercent: q.regularMarketChangePercent,
          }))
        );
      } catch (err) {
        console.error('Price poll failed for', uid, err);
      }
    }
  }, 10_000);
}