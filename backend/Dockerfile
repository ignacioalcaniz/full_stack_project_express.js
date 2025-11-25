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

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV NODE_ENV=production
ENV PORT=8080

ENV SKIP_ENV_CHECK=true

COPY --from=builder /app ./

RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app/uploads

RUN npm cache clean --force

EXPOSE 8080

USER appuser

CMD ["node", "src/server.js"]








