# Phase 1: build
FROM node:20-alpine AS builder

# Base URL of the Repitt API including the /v1 prefix, e.g. https://api.repitt.com/v1
ARG VITE_API_URL
ARG VITE_APP_VERSION=1.0

WORKDIR /app

RUN npm install -g pnpm@8.15.9

# Copy everything first: the Vuexy postinstall (build:icons) needs src/
COPY . .

# .env.production.local has the highest precedence in a production build
RUN test -n "$VITE_API_URL" || (echo "VITE_API_URL build arg is required" && exit 1) && \
    echo "VITE_API_URL=${VITE_API_URL}" > .env.production.local && \
    echo "VITE_APP_VERSION=${VITE_APP_VERSION}" >> .env.production.local

RUN pnpm install --frozen-lockfile

RUN pnpm run build

# Phase 2: static server
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
