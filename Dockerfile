FROM node:18-alpine

WORKDIR /usr/app/src

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD [ "node", "./dist/src/index.js" ]