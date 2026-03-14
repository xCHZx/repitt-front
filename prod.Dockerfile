# Fase 1: Construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Instalamos pnpm globalmente
RUN npm install -g pnpm@8.6.2

# Copiamos TODOS los archivos de configuración de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalamos dependencias usando pnpm de forma estricta y limpia
RUN pnpm install --frozen-lockfile

# Copiamos el resto del código
COPY . .

# Construimos la aplicación
RUN pnpm run build

# Fase 2: Servidor Web (Nginx)
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
