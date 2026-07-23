FROM node:20-alpine

WORKDIR /app

COPY battleasia-admin-main/battleasia-admin-main/package.json battleasia-admin-main/battleasia-admin-main/package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY battleasia-admin-main/battleasia-admin-main/ .

EXPOSE 3000

CMD ["npm", "start"]
