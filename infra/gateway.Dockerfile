FROM node:18-alpine

WORKDIR /usr/src/app

COPY ./gateway/package*.json ./

RUN npm install

COPY ./gateway/src ./src
COPY ./gateway/tsconfig.json .

RUN npm run build

CMD [ "node", "dist/index.js" ]
