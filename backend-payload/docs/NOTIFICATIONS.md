# Система уведомлений

Многоканальная система уведомлений для автоматизации контента. Все существующие вызовы `notify()` автоматически рассылают уведомления по всем настроенным каналам.

## Архитектура

```
Вызовы notify() (7 точек, без изменений)
    │
    ▼
telegram-bot.ts: notify()
    │
    ▼
notification-service.ts: dispatch()
    ├── TelegramChannel  (с поддержкой тем форума)
    ├── EmailChannel      (SMTP через nodemailer)
    └── PayloadChannel    (REST API → коллекция Notifications)
```

Каждый канал изолирован — сбой одного не блокирует остальные (`Promise.allSettled`).
`notify()` возвращает `success: true`, если хотя бы один канал отработал.

## Каналы

### 1. Telegram (с темами форума)

Базовый канал. Работает как и раньше, но теперь поддерживает маршрутизацию сообщений в темы (topics) форума Telegram.

**Переменные окружения** (в `backend-payload/.env`):

```env
# Обязательные (уже настроены)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# Опциональные — ID тем форума
# Получить ID: отправьте сообщение в тему, затем через Bot API getUpdates
# найдите message_thread_id
TELEGRAM_TOPIC_CONTENT=123    # Тема "Публікації" — новый контент
TELEGRAM_TOPIC_ERRORS=456     # Тема "Помилки" — ошибки
TELEGRAM_TOPIC_REPORTS=789    # Тема "Звіти" — еженедельные отчёты, инфо
```

**Маршрутизация по типам:**

| Тип уведомления  | Тема форума            |
|------------------|------------------------|
| `new_content`    | TELEGRAM_TOPIC_CONTENT |
| `error`          | TELEGRAM_TOPIC_ERRORS  |
| `weekly_summary` | TELEGRAM_TOPIC_REPORTS |
| `info`           | TELEGRAM_TOPIC_REPORTS |

Если переменные тем не заданы — сообщения отправляются в общий чат (обратная совместимость).

**Как получить ID темы форума:**

1. Создайте группу Telegram и включите «Темы» в настройках
2. Создайте темы: «Публікації», «Помилки», «Звіти»
3. Добавьте бота в группу и дайте ему права на отправку сообщений
4. Отправьте сообщение в каждую тему
5. Вызовите `https://api.telegram.org/bot<TOKEN>/getUpdates`
6. Найдите `message_thread_id` для каждой темы

### 2. Email (SMTP)

Отправляет HTML-письма с брендированным шаблоном Bridgestone.

**Переменные окружения:**

```env
SMTP_HOST=smtp.gmail.com       # SMTP-сервер
SMTP_PORT=587                   # Порт (587 для STARTTLS, 465 для SSL)
SMTP_USER=alerts@bridgestone.ua # Логин
SMTP_PASS=app-password          # Пароль (для Gmail — App Password)
SMTP_FROM=Bridgestone UA <alerts@bridgestone.ua>  # Опционально, по умолчанию = SMTP_USER
NOTIFY_EMAILS=admin@bridgestone.ua,manager@bridgestone.ua  # Получатели через запятую
```

**Канал активен**, когда заданы `SMTP_HOST`, `SMTP_USER` и `NOTIFY_EMAILS`.

**Тема письма формируется автоматически:**

| Тип              | Префикс темы  |
|------------------|----------------|
| `new_content`    | [Контент]      |
| `error`          | [Помилка]      |
| `weekly_summary` | [Звіт]        |
| `info`           | [Інфо]        |

**Настройка Gmail:**

1. Включите 2FA в аккаунте Google
2. Создайте App Password: Google Account → Security → App passwords
3. Используйте App Password как `SMTP_PASS`

### 3. Payload Admin (база данных)

Сохраняет уведомления в коллекцию Notifications CMS. Отображает их в:
- Колокольчик (bell icon) в шапке админ-панели
- Секция «Останні повідомлення» на дашборде
- Коллекция `/admin/collections/notifications`

**Переменные окружения:**

```env
# Включён по умолчанию. Чтобы отключить:
NOTIFY_PAYLOAD_ENABLED=false

# API-ключ для авторизации (опционально, если automation и Payload на одном сервере)
PAYLOAD_API_KEY=your-api-key
```

**Канал активен** по умолчанию (`NOTIFY_PAYLOAD_ENABLED` не равно `false`).

**Получение API-ключа:**

1. Откройте `/admin/collections/users`
2. Выберите пользователя (или создайте сервисного)
3. Включите «Enable API Key» и скопируйте ключ
4. Добавьте в `.env` как `PAYLOAD_API_KEY`

**Колокольчик (NotificationBell):**

- Отображается в правом верхнем углу админ-панели
- Опрашивает `/api/notifications/count` каждые 30 секунд
- Клик открывает выпадающий список с 10 последними уведомлениями
- Клик по непрочитанному — помечает как прочитанное
- Кнопка «Прочитати всі» — помечает все как прочитанные
- Ссылка «Усі» — переход в коллекцию Notifications

## Быстрый старт

### Минимальная настройка (только Telegram, как раньше)

Никаких изменений не требуется. Если `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` уже в `.env`, всё работает.

### Полная настройка (все 3 канала)

Добавьте в `backend-payload/.env`:

```env
# Telegram с темами
TELEGRAM_TOPIC_CONTENT=123
TELEGRAM_TOPIC_ERRORS=456
TELEGRAM_TOPIC_REPORTS=789

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@bridgestone.ua
SMTP_PASS=your-app-password
NOTIFY_EMAILS=admin@bridgestone.ua

# Payload (включён по умолчанию, API-ключ опционален)
PAYLOAD_API_KEY=your-api-key
```

Перезапустите бэкенд:

```bash
cd backend-payload && npm run dev
```

## Проверка

### Тест Telegram

```bash
cd backend-payload
npx tsx content-automation/src/publishers/telegram-bot.ts
```

### Тест через автоматизацию

```bash
cd backend-payload
npm run automation -- test-telegram
```

### Проверка Payload

1. Откройте `/admin` — колокольчик должен появиться в шапке
2. Запустите `npm run automation:full`
3. Проверьте `/admin/collections/notifications` — должны появиться записи
4. На дашборде — секция «Останні повідомлення»

### Проверка Email

Настройте SMTP-переменные и запустите автоматизацию — письмо придёт на `NOTIFY_EMAILS`.

## API-эндпоинты

| Метод | Путь                          | Описание                    | Авторизация |
|-------|-------------------------------|-----------------------------|-------------|
| GET   | `/api/notifications`          | Список (стандартный Payload)| Пользователь|
| GET   | `/api/notifications/count`    | Кол-во непрочитанных        | Пользователь|
| POST  | `/api/notifications/mark-read`| Пометить одно прочитанным   | Пользователь|
| POST  | `/api/notifications/mark-all-read`| Пометить все прочитанными| Пользователь|

**mark-read body:** `{ "id": "notification-id" }`

## Структура файлов

```
content-automation/src/publishers/
├── notification-service.ts          # Диспетчер, интерфейс канала
├── telegram-bot.ts                  # Точка входа notify() → dispatch()
└── channels/
    ├── telegram-channel.ts          # Telegram + темы форума
    ├── email-channel.ts             # SMTP через nodemailer
    └── payload-channel.ts           # REST API → Notifications

backend-payload/src/
├── collections/Notifications.ts     # Коллекция Payload
├── endpoints/notifications.ts       # count, mark-read, mark-all-read
└── components/
    ├── NotificationBell.tsx          # Колокольчик в шапке
    └── DashboardNotifications.tsx    # Секция на дашборде
```
