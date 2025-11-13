# ---------- Build Stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Fuerza a instalar TODAS las dependencias, incluso devDependencies
# para que mongodb-memory-server esté disponible en CI/CD
ENV NODE_ENV=test

COPY package*.json ./

# npm ci normal (sin omit=dev)
RUN npm ci

COPY . .

# ---------- Run Stage ----------
FROM node:20-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Para producción real
ENV NODE_ENV=production
ENV PORT=8080

# Copiamos TODO lo que instaló el builder, incluyendo mongodb-memory-server
COPY --from=builder /app ./

# Limpiamos caché
RUN npm cache clean --force

EXPOSE 8080

USER appuser

CMD ["node", "src/server.js"]





