# Fase 1: Construcción
FROM node:20-alpine AS builder

ARG VITE_API_URL
ARG VITE_APP_VERSION=1.0

WORKDIR /app

RUN npm install -g pnpm@8.6.2

COPY . .

RUN echo "VITE_API_URL=${VITE_API_URL}" > .env && \
    echo "VITE_APP_VERSION=${VITE_APP_VERSION}" >> .env

RUN pnpm install --frozen-lockfile

RUN pnpm run build

# Fase 2: Servidor Web (Nginx)
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
