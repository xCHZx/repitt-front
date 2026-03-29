# Fase 1: Construcción
FROM node:18-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@8.6.2

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm run build -- --mode qa

# Fase 2: Servidor Web (Nginx)
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
