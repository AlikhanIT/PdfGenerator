FROM node:16

WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       chromium \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 1984

CMD ["npm", "start"]
