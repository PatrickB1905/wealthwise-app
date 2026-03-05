FROM node:20-alpine AS build
WORKDIR /repo

COPY package.json yarn.lock ./
COPY frontend/package.json ./frontend/package.json

RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn config set network-timeout 600000 -g \
 && yarn install --frozen-lockfile --non-interactive

COPY frontend ./frontend
RUN yarn workspace frontend build

FROM nginx:alpine

COPY frontend/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]