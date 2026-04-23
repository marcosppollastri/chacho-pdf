# Build stage
FROM node:20-slim AS builder

# Install LibreOffice, pandoc and poppler-utils
RUN apt-get update && apt-get install -y \
    libreoffice-writer \
    pandoc \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-slim AS production

RUN apt-get update && apt-get install -y \
    libreoffice-writer \
    pandoc \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
