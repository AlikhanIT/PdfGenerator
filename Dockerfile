FROM node:16

WORKDIR /usr/src/app

# Обновите конфигурацию APT для обхода проблем с прокси и кэшем
RUN echo "Acquire::http::Pipeline-Depth 0;" > /etc/apt/apt.conf.d/99custom && \
    echo "Acquire::http::No-Cache true;" >> /etc/apt/apt.conf.d/99custom && \
    echo "Acquire::BrokenProxy true;" >> /etc/apt/apt.conf.d/99custom

# Обновите пакеты, установите необходимые пакеты и Chromium
RUN apt-get update && \
    apt-get install -y \
       chromium \
       chromium-driver \
       ca-certificates \
       wget \
       --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Установите Node.js зависимости
COPY package*.json ./
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm config set strict-ssl false && \
    npm install

# Скопируйте остальные файлы проекта
COPY . .

# Откройте порт для вашего приложения
EXPOSE 1984

# Установите команду для запуска приложения
CMD ["npm", "start"]
