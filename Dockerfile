FROM node:18

WORKDIR /usr/src/app

ENV PORT 8080
ENV GOOGLE_PROJECT_ID affable-seat-399022
ENV BUCKET_NAME magga_app_bucket

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD npm start