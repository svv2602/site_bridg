#### Kроки для запуску Strapi CMS

  # 1. Запуск Strapi (в окремому терміналі)

  cd /home/snisar/RubyProjects/site_Bridgestone/backend
  npm run develop

  Після запуску відкриється: http://localhost:1337/admin

  ---
  # 2. Створення Admin акаунта

  При першому запуску Strapi попросить створити адміністратора:
  - First name: Admin
  - Last name: Bridgestone
  - Email: admin@bridgestone.ua
  - Password: (ваш пароль)

  ---
  # 3. Налаштування публічного API доступу

  В адмін-панелі Strapi:

  1. Settings → Users & Permissions Plugin → Roles → Public
  2. Для кожного Content Type увімкнути:
    - ✅ find (список)
    - ✅ findOne (один запис)
  ┌─────────────────┬──────┬─────────┐
  │  Content Type   │ find │ findOne │
  ├─────────────────┼──────┼─────────┤
  │ Tyre            │ ✅   │ ✅      │
  ├─────────────────┼──────┼─────────┤
  │ Dealer          │ ✅   │ ✅      │
  ├─────────────────┼──────┼─────────┤
  │ Article         │ ✅   │ ✅      │
  ├─────────────────┼──────┼─────────┤
  │ Technology      │ ✅   │ ✅      │
  ├─────────────────┼──────┼─────────┤
  │ Vehicle-fitment │ ✅   │ ✅      │
  └─────────────────┴──────┴─────────┘
  3. Натиснути Save

  ---
  # 4. Додавання контенту

  В адмін-панелі: Content Manager →

  Tyres:
  - Натиснути "Create new entry"
  - Заповнити: name, slug, season, vehicleTypes, sizes...
  - Натиснути "Publish"

  Dealers:
  - Додати дилерів з координатами для карти

  ---
  # 5. Створення API Token (опційно, для захищеного доступу)

  1. Settings → API Tokens → Create new API Token
  2. Name: Frontend
  3. Token type: Read-only
  4. Скопіювати токен

  ---
  # 6. Налаштування Frontend

  Створити файл frontend/.env.local:

  # Strapi
  NEXT_PUBLIC_STRAPI_URL=http://localhost:1337

  # Якщо використовуєте токен:
  STRAPI_API_TOKEN=ваш_токен_тут

  # Analytics (якщо є)
  NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
  NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXX

  # Google Maps (якщо є ключ)
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=ваш_ключ

  # Cookies
  NEXT_PUBLIC_COOKIES_BANNER_ENABLED=true

  ---
  # 7. Перевірка API

  Після налаштування прав доступу:

  # Перевірити API
  curl http://localhost:1337/api/tyres
  curl http://localhost:1337/api/dealers
  curl http://localhost:1337/api/articles

  ---
  # 8. Запуск Frontend

  cd /home/snisar/RubyProjects/site_Bridgestone/frontend
  npm run dev

  Відкриється: http://localhost:3000

  ---
  Структура проекту

  site_Bridgestone/
  ├── frontend/          # Next.js (порт 3000)
  │   └── .env.local     # Env змінні
  ├── backend/           # Strapi CMS (порт 1337)
  │   └── .env           # Strapi env
  └── .claude/checklists/ # Виконані чеклісти