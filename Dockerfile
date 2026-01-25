# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .

# Build arguments for VITE environment variables
ARG VITE_API_BASE_URL
ARG VITE_TOKEN_SECRET_KEY
ARG VITE_GOOGLE_MAPS_API_KEY

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_TOKEN_SECRET_KEY=$VITE_TOKEN_SECRET_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Add nginx config to handle SPA routing if needed
RUN echo 'server { \
    listen 8080; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
