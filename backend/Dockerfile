# ---------- Build Stage ----------
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# ---------- Run Stage ----------
FROM node:20-alpine
WORKDIR /app

# Crear user seguro
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV NODE_ENV=production
ENV PORT=8080

# 🚫 Clave: saltar check-env dentro del container
ENV SKIP_ENV_CHECK=true

# Copiar archivos
COPY --from=builder /app ./

# Crear uploads y dar permisos
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app/uploads

# Limpiar cache
RUN npm cache clean --force

EXPOSE 8080

# Usar user seguro
USER appuser

CMD ["node", "src/server.js"]








