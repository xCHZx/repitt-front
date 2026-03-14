# Fase 1: Construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Instalamos pnpm globalmente
RUN npm install -g pnpm@8.6.2

# Copiamos TODOS los archivos primero.
# Esto garantiza que el script "postinstall" de Vuexy encuentre el código fuente (src/...)
COPY . .

# Instalamos dependencias. El postinstall ahora se ejecutará exitosamente.
RUN pnpm install --frozen-lockfile

# Construimos la aplicación
RUN pnpm run build

# Fase 2: Servidor Web (Nginx)
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
