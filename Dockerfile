# Используйте официальный образ Node.js
FROM node:16

# Обновляем список пакетов
RUN apt-get update

# Устанавливаем необходимые зависимости, включая Chromium Browser
RUN apt-get install -y --no-install-recommends \
    libasound2 \
    chromium

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
