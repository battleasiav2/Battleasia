FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && mkdir -p /app/uploads
COPY --from=build /app/dist ./dist
EXPOSE 5050
HEALTHCHECK --interval=15s --timeout=5s --retries=8 --start-period=45s \
  CMD node -e "fetch('http://127.0.0.1:5050/ready').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]
