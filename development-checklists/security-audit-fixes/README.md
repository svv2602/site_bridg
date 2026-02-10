# Security Audit Fixes

## Ціль
Усунути всі проблеми безпеки, виявлені в SECURITY_AUDIT.md та RELEASE_READINESS_REPORT.md. Захистити GET-ендпоінти, додати security headers на backend, посилити CSP, прибрати hardcoded credentials, налаштувати access control.

## Критерії успіху
- [ ] Всі GET-ендпоінти automation/content/image-regeneration повертають 401 без аутентифікації
- [ ] Backend повертає security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- [ ] X-Powered-By видалено з відповідей backend
- [ ] CSP не містить 'unsafe-eval' (або задокументована необхідність)
- [ ] Hardcoded fallback 'admin123' видалено з payload-client.ts
- [ ] Явні access rules для ContactSubmissions та Media
- [ ] Health endpoint не розкриває version та environment

## Фази роботи
1. [P0 Blockers -- Захист GET-ендпоінтів](phase-01-get-endpoints-auth.md) - додати перевірку req.user на всі GET-ендпоінти
2. [P0 Blockers -- Security Headers на Backend](phase-02-backend-security-headers.md) - додати security headers в payload.config.ts
3. [P0 Blockers -- CSP та Hardcoded Credentials](phase-03-csp-and-credentials.md) - посилити CSP, прибрати hardcoded паролі
4. [P2 -- HSTS, Fallback Secret, Access Control](phase-04-hsts-fallback-access.md) - HSTS, fallback secret, access rules
5. [P3 -- DOMPurify, Rate Limiter, Basic Auth](phase-05-dompurify-ratelimit-basicauth.md) - iframe домени, brute-force захист, документація

## Джерело вимог
- `plan/prompt/AUDIT_AI_AGENT/report/SECURITY_AUDIT.md`
- `plan/prompt/AUDIT_AI_AGENT/report/RELEASE_READINESS_REPORT.md` (P0-1, P0-2, P0-3, P0-4, P2-24..27)

## Правила перевикористання коду

### ОБОВ'ЯЗКОВО перед реалізацією:
1. **Пошук існуючого функціоналу** - перед написанням нового коду ЗАВЖДИ шукай схожий існуючий код
2. **Аналіз патернів** - вивчи як реалізовані схожі фічі в проекті
3. **Перевикористання компонентів** - використовуй існуючі компоненти, хуки, утиліти

### Де шукати:
```
backend-payload/src/
├── endpoints/              # API ендпоінти (contentGeneration, automation, imageRegeneration, health)
├── collections/            # Payload колекції (ContactSubmissions, Media, Users)
├── lib/                    # Утиліти (rate-limiter.ts, sentry.ts)
└── payload.config.ts       # Головна конфігурація Payload CMS

frontend/
├── next.config.ts          # Security headers, CSP
├── src/middleware.ts        # Basic Auth middleware
└── src/components/
    └── LexicalRenderer.tsx  # DOMPurify конфіг
```

### Чекліст перед написанням коду:
- [ ] Шукав схожий функціонал в codebase?
- [ ] Вивчив патерни з схожих файлів?
- [ ] Перевикористовую існуючі компоненти/утиліти?
- [ ] Дотримуюся conventions проекту?

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
