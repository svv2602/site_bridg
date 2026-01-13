#!/bin/bash

# Скрипт запуска Payload Backend для Bridgestone Ukraine

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Запуск Payload Backend (Bridgestone Ukraine)...${NC}"

# Освобождаем порт 3001
echo -e "${BLUE}🔄 Проверка и освобождение порта 3001...${NC}"
# Используем fuser для более надёжного поиска процессов на порту
BACKEND_PIDS=$(fuser 3001/tcp 2>/dev/null || lsof -ti:3001 2>/dev/null || true)
if [ ! -z "$BACKEND_PIDS" ]; then
    echo -e "${BLUE}🛑 Останавливаем процессы на порту 3001 (PID: $BACKEND_PIDS)${NC}"
    # Убиваем все процессы на порту
    fuser -k 3001/tcp 2>/dev/null || kill -9 $BACKEND_PIDS 2>/dev/null || true
    # Ждём освобождения порта (до 5 секунд)
    for i in {1..5}; do
        if ! fuser 3001/tcp >/dev/null 2>&1; then
            break
        fi
        sleep 1
    done
    echo -e "${GREEN}✅ Порт 3001 освобожден${NC}"
else
    echo -e "${GREEN}✅ Порт 3001 свободен${NC}"
fi

# Переход в директорию backend-payload
cd /home/snisar/RubyProjects/site_Bridgestone/backend-payload || exit 1

# Проверка node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Установка зависимостей...${NC}"
    npm install
fi

# Проверка .env файла
echo -e "${BLUE}🔍 Проверка конфигурации...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}⚠️  Файл .env не найден!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Файл .env найден${NC}"
fi

# Проверка PostgreSQL
echo -e "${BLUE}🔍 Проверка PostgreSQL...${NC}"
if psql -lqt | cut -d \| -f 1 | grep -qw bridgestone; then
    echo -e "${GREEN}✅ База данных bridgestone существует${NC}"
else
    echo -e "${BLUE}📦 Создание базы данных bridgestone...${NC}"
    createdb bridgestone || echo -e "${RED}⚠️  Не удалось создать БД${NC}"
fi

# Запуск Payload
echo -e "${GREEN}🎯 Запуск Payload на http://localhost:3001${NC}"
echo -e "${BLUE}📊 Admin panel: http://localhost:3001/admin${NC}"
echo -e "${BLUE}📡 API: http://localhost:3001/api${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

npm run dev
