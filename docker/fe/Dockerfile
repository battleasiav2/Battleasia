FROM node:20-alpine

WORKDIR /app

COPY battleasia-fe-main/battleasia-fe-main/package.json battleasia-fe-main/battleasia-fe-main/package-lock.json ./

RUN npm ci

COPY battleasia-fe-main/battleasia-fe-main/ .

EXPOSE 8081

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8081"]
