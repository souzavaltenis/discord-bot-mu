FROM node:20-alpine

WORKDIR /usr/app/src

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run tsc

CMD [ "node", "./dist/src/index.js" ]