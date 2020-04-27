FROM node:latest AS baseline
WORKDIR /usr/src/app/gtfsloader
COPY ./package.json /usr/src/app/gtfsloader

#FROM baseline AS tester
#RUN npm install
#COPY . /usr/src/app/gtfsloader
#RUN npm run lint

FROM baseline AS production
#RUN npm install package-lock.json -- production
RUN npm install
COPY ./src/ /usr/src/app/gtfsloader/src/
RUN mkdir -p /usr/src/app/gtfsloader/gtfs-export/download
EXPOSE 3000
CMD ["npm", "run", "prod"]
