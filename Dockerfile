# ==============================================================================
# Build stage: compila la app React + Vite
# ==============================================================================
FROM node:22-alpine AS build

WORKDIR /app

# Instalar dependencias primero para aprovechar la caché de capas
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# URL base del backend, se incrusta en el bundle en tiempo de compilación.
# Vacía por defecto: el navegador llama a /api en el mismo origen y Nginx
# lo reenvía al contenedor del backend.
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ==============================================================================
# Runner stage: sirve los archivos estáticos con Nginx
# ==============================================================================
FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
