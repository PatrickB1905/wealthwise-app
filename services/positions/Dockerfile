FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock tsconfig.json ./
COPY prisma ./prisma
RUN yarn install --frozen-lockfile
RUN npx prisma generate
COPY src ./src
RUN yarn build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY prisma/schema.prisma ./prisma/schema.prisma
COPY .env .
EXPOSE 4000
CMD ["node", "dist/index.js"]