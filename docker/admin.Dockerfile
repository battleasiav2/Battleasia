FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY admin.battleasia.gg/package.json admin.battleasia.gg/package-lock.json ./
RUN npm ci
COPY admin.battleasia.gg/ ./
ARG VITE_PLAYER_URL=http://localhost:8088
ARG VITE_SENTRY_DSN=
ENV VITE_PLAYER_URL=$VITE_PLAYER_URL
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
RUN npm run build

FROM nginx:1.27-alpine
COPY docker/nginx/spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
