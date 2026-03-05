FROM node:20-alpine AS build
WORKDIR /repo

ARG VITE_POSITIONS_API_URL
ARG VITE_MARKET_DATA_API_URL
ARG VITE_ANALYTICS_API_URL
ARG VITE_NEWS_API_URL

ENV VITE_POSITIONS_API_URL=$VITE_POSITIONS_API_URL
ENV VITE_MARKET_DATA_API_URL=$VITE_MARKET_DATA_API_URL
ENV VITE_ANALYTICS_API_URL=$VITE_ANALYTICS_API_URL
ENV VITE_NEWS_API_URL=$VITE_NEWS_API_URL

COPY package.json yarn.lock ./

COPY frontend/package.json ./frontend/package.json

RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn config set network-timeout 600000 -g \
 && yarn install --frozen-lockfile --non-interactive

COPY frontend ./frontend

RUN yarn workspace frontend build

FROM nginx:alpine
COPY --from=build /repo/frontend/dist /usr/share/nginx/html
EXPOSE 80
