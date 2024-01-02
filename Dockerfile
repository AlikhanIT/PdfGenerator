# Используйте официальный образ Node.js
FROM node:16

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /usr/src/app

# Установка зависимостей
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       chromium \
    && rm -rf /var/lib/apt/lists/*

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
