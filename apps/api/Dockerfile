# syntax=docker/dockerfile:1

# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma engines on Alpine
RUN apk add --no-cache openssl

# Copy root workspace configuration
COPY package.json package-lock.json* ./
# Copy API package configuration and Prisma schema
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/tsconfig.json ./apps/api/

# Install all dependencies (including dev) to compile TypeScript
RUN npm install

# Copy API source and build
COPY apps/api/src ./apps/api/src
WORKDIR /app/apps/web
# (no-op: needed to keep /app as the workspace root, the build below runs in /app/apps/api)

WORKDIR /app
RUN npm run build --workspace apps/api

# ---------- Stage 2: api runtime ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

# Copy root + api package configurations and Prisma schema
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma

# Install only production dependencies for the api workspace
RUN npm install --omit=dev && npx prisma generate --schema=apps/api/prisma/schema.prisma

# Copy compiled output
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 3001

WORKDIR /app/apps/api
# Migrations are NOT run here on purpose. They are executed by the
# dedicated `migrate` service (see docker-compose.dev.yml) so the API
# container can scale horizontally without race conditions.
CMD ["node", "dist/server.js"]

# ---------- Stage 3: migrations runner ----------
FROM node:20-alpine AS migrate

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma

# Install only production dependencies (includes the Prisma CLI + engines)
RUN npm install --omit=dev

WORKDIR /app/apps/api

# Apply pending Prisma migrations. The container is a one-shot:
# it runs the command and exits with status 0 (or non-zero on failure).
CMD ["npx", "prisma", "migrate", "deploy"]
