# ASTRA-X Frontend Dockerfile (Optional / Multi-stage Production Build)
# Note: Marked optional/untested per Part 8 instructions if local Docker engine is not available.

# Stage 1: Build the static assets
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
