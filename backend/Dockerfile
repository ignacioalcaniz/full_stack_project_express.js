# ---------- Build Stage ----------
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# Copiamos manifiestos e instalamos deps (sin dev)
COPY package*.json ./
RUN npm ci --omit=dev

# Copiamos el resto del código
COPY . .

# ---------- Run Stage ----------
FROM node:20-alpine
WORKDIR /app

# Crear usuario seguro
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV NODE_ENV=production
ENV PORT=8080

# Copiar todo desde el builder (incluye node_modules)
COPY --from=builder /app ./

# 🔧 IMPORTANTE: crear carpetas con permisos ANTES de cambiar de usuario
RUN mkdir -p /app/uploads /app/logs && \
    chown -R appuser:appgroup /app/uploads /app/logs

# Limpiar cache npm
RUN npm cache clean --force

EXPOSE 8080

# Usar usuario no-root
USER appuser

CMD ["node", "src/server.js"]







