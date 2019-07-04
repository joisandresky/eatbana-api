FROM node:10.16-jessie

WORKDIR /usr/app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]