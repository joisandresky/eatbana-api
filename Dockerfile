FROM node:alpine

WORKDIR /usr/app

RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++ \
    && npm install \
    && apk del build-dependencies

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]