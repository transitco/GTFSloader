FROM node:14.9.0-buster-slim AS baseline
RUN apt-get update && apt-get install -y --no-install-recommends \
    python2.7 \
    python-pip \
    python-setuptools \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN pip install wheel
RUN pip install transitfeed
WORKDIR /usr/src/app/gtfsloader
COPY ./package.json /usr/src/app/gtfsloader

FROM baseline AS tester
RUN npm install
COPY . /usr/src/app/gtfsloader
RUN npm run lint

FROM baseline AS production
#RUN npm install package-lock.json -- production
RUN npm install
COPY ./src/ /usr/src/app/gtfsloader/src/
RUN mkdir -p /usr/src/app/download

EXPOSE 3000
CMD ["npm", "run", "prod"]
