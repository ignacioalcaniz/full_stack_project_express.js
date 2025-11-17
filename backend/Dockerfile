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

# Crear usuario no root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV NODE_ENV=production
ENV PORT=8080

# Copiar solo artefactos necesarios
COPY --from=builder /app ./

# Minimizar superficie
RUN npm cache clean --force

EXPOSE 8080

# Permisos mínimos
USER appuser

CMD ["node", "src/server.js"]




