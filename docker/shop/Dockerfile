FROM node:20-alpine

WORKDIR /app

COPY shop.battleasia.gg/package.json shop.battleasia.gg/package-lock.json ./

RUN npm ci

COPY shop.battleasia.gg/ .

EXPOSE 8082

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8082"]
