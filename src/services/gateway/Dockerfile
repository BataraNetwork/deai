FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install grpc-tools

COPY . .

RUN npm run build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1

CMD [ "node", "dist/index.js" ]
