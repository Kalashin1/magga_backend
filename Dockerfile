FROM node:18

WORKDIR /usr/src/app

ENV PORT 8080

ENV DB_USERNAME=magga_app
ENV DB_PASSWORD=magga_app
ENV DB=magga_app
ENV PORT=8080
ENV DB_HOST=db4free.net
ENV DB_PORT=3306
ENV environment=PRODUCTION

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD npm start