# Stage 1: Compiling TypeScript/Vite bundle
FROM node:20-alpine AS builder

# Build-time only. The web bundle is fully static, so the URL of the
# REST API is baked in at build time by Vite (VITE_*-prefixed env vars).
ARG VITE_API_BASE_URL=http://localhost:3001
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app

# Copy root workspace configurations
COPY package.json ./
# Copy frontend package specifications
COPY apps/web/package.json ./apps/web/

# Install dependencies for workspaces
RUN npm install

# Copy application source files
COPY apps/web/ ./apps/web/

# Compile React bundle
WORKDIR /app/apps/web
RUN npm run build

# Stage 2: Exposing static bundle via lightweight Nginx web server
FROM nginx:1.25-alpine AS runner

# Copy customized Nginx configurations
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from builder
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
