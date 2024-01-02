# Используйте официальный образ Node.js
FROM node:16

# Обновляем список пакетов
RUN apt-get update

# Устанавливаем необходимые зависимости, включая Chromium Browser
RUN apt-get install -y --no-install-recommends \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libexpat1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libuuid1 \
    libx11-6 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxkbcommon0 \
    libxrandr2 \
    libxrender1 \
    libxshmfence1 \
    libxss1 \
    libxtst6 \
    chromium-browser

# Очищаем кэш
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Создаем пользователя "appuser"
RUN useradd -ms /bin/bash appuser

# Переключаемся на пользователя "appuser"
USER appuser

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /usr/src/app

# Копируем файл package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Экспонируем порт, если ваше приложение слушает порт внутри контейнера
EXPOSE 987

# Команда для запуска вашего приложения
CMD ["npm", "start"]
