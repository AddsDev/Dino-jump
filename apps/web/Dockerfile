# Stage 1: Compiling TypeScript/Vite bundle
FROM node:20-alpine AS builder

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
