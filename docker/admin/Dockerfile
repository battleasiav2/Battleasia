FROM node:20-alpine

WORKDIR /app

COPY admin.battleasia.gg/package.json admin.battleasia.gg/package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY admin.battleasia.gg/ .

EXPOSE 3000

CMD ["npm", "start"]
