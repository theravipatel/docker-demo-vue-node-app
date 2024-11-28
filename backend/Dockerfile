FROM node:lts-alpine3.19
WORKDIR /docker-demo-node-app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 5000
CMD [ "node", "index.js" ]