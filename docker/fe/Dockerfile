FROM node:20-alpine

WORKDIR /app

COPY battleasia.gg/package.json battleasia.gg/package-lock.json ./

RUN npm ci

COPY battleasia.gg/ .

EXPOSE 8081

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8081"]
