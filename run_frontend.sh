#!/bin/bash

# Скрипт для запуска Frontend Bridgestone Ukraine
# Backend (Payload) запускается автоматически, если не запущен

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Запуск Frontend (Bridgestone Ukraine)...${NC}"

# 1. Проверяем, запущен ли Backend (Payload на порту 3001)
BACKEND_PID=$(lsof -ti:3001)

if [ -z "$BACKEND_PID" ]; then
    echo -e "${BLUE}📦 Payload Backend не запущен, запускаем...${NC}"
    cd /home/snisar/RubyProjects/site_Bridgestone/backend-payload || exit 1

    # Проверка node_modules
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}📦 Установка зависимостей backend...${NC}"
        npm install
    fi

    nohup npm run dev > /tmp/payload.log 2>&1 &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Payload запущен (PID: $BACKEND_PID)${NC}"
    echo -e "${BLUE}⏳ Ожидание запуска Payload (10 сек)...${NC}"
    sleep 10
else
    echo -e "${GREEN}✅ Payload уже запущен (PID: $BACKEND_PID)${NC}"
fi

# 2. Проверяем доступность Backend
echo -e "${BLUE}🔍 Проверка доступности Payload...${NC}"
if curl -s http://localhost:3001/api > /dev/null 2>&1 || curl -s http://localhost:3001/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Payload доступен на http://localhost:3001${NC}"
else
    echo -e "${RED}⚠️  Payload не отвечает, но продолжаем запуск Frontend${NC}"
fi

# 3. Освобождаем порт 3010
echo -e "${BLUE}🔄 Проверка и освобождение порта 3010...${NC}"
FRONTEND_PID=$(lsof -ti:3010)
if [ ! -z "$FRONTEND_PID" ]; then
    echo -e "${BLUE}🛑 Останавливаем процесс на порту 3010 (PID: $FRONTEND_PID)${NC}"
    kill -9 $FRONTEND_PID 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}✅ Порт 3010 освобожден${NC}"
else
    echo -e "${GREEN}✅ Порт 3010 свободен${NC}"
fi

# Дополнительно останавливаем старые Frontend процессы
pkill -f "node.*next" 2>/dev/null || true

# 4. Переходим в директорию Frontend
cd /home/snisar/RubyProjects/site_Bridgestone/frontend || exit 1

# 5. Проверка node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Установка зависимостей frontend...${NC}"
    npm install
fi

# 6. Запускаем Frontend dev server
echo -e "${GREEN}🎨 Запуск Frontend на http://localhost:3010${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
PORT=3010 npm run dev
