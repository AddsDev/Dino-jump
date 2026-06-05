# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma engines on Alpine
RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY tsconfig.json ./

# Install all dependencies (including dev) to compile TypeScript
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source and build
COPY src ./src
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Install only production dependencies
RUN npm install --omit=dev && npx prisma generate

# Copy compiled output
COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Run database migrations before starting the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
