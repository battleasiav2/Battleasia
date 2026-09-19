FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY battleasia.gg/package.json battleasia.gg/package-lock.json ./
RUN npm ci
COPY battleasia.gg/ ./
ARG VITE_BAC_SHOP_URL=http://localhost:8083
ARG VITE_SENTRY_DSN=
ENV VITE_BAC_SHOP_URL=$VITE_BAC_SHOP_URL
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
RUN npm run build

FROM nginx:1.27-alpine
COPY docker/nginx/spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
