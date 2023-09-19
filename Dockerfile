FROM node:18

WORKDIR /usr/src/app

ENV PORT 8080
ENV DB_URL mongodb+srv://kalashin:Kalashin1@cluster0.4umw1.gcp.mongodb.net/magga?retryWrites=true&w=majority

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD npm start