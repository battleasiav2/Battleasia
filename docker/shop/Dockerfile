FROM node:20-alpine

WORKDIR /app

COPY battleasia-shop-main/battleasia-shop-main/package.json battleasia-shop-main/battleasia-shop-main/package-lock.json ./

RUN npm ci

COPY battleasia-shop-main/battleasia-shop-main/ .

EXPOSE 8082

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8082"]
