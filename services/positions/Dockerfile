FROM node:18-alpine AS builder
WORKDIR /app

COPY yarn.lock ./yarn.lock
COPY services/positions/package.json ./package.json
COPY services/positions/tsconfig.json ./tsconfig.json
COPY services/positions/prisma ./prisma

RUN yarn install --frozen-lockfile
RUN npx prisma generate

COPY services/positions/src ./src
RUN yarn build


FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
