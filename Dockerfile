FROM node:latest

WORKDIR /usr/src/app/gtfsloader

COPY ./package.json /usr/src/app/gtfsloader

RUN npm install
COPY . /usr/src/app/gtfsloader

EXPOSE 4000
CMD npm run dev
