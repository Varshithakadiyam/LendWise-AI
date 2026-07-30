# Build Phase
FROM node:20-alpine AS build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .

# Ensure VITE_BACKEND_URL is set during build (or overridden dynamically)
ENV VITE_BACKEND_URL=http://localhost:8000
RUN npm run build

# Serve Phase
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
