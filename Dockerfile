FROM node:16

WORKDIR /usr/src/app

RUN echo "Acquire::http::Pipeline-Depth 0;" > /etc/apt/apt.conf.d/99custom && \
    echo "Acquire::http::No-Cache true;" >> /etc/apt/apt.conf.d/99custom && \
    echo "Acquire::BrokenProxy true;" >> /etc/apt/apt.conf.d/99custom

RUN apt-get update && \
    apt-get install -y \
       chromium \
       chromium-driver \
       ca-certificates \
       wget \
       --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package*.json ./
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm config set strict-ssl false && \
    npm install

COPY . .

EXPOSE 1984

CMD ["npm", "start"]
