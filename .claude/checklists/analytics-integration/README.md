# GA4 + Meta Pixel — аналітика

## Ціль
Інтегрувати Google Analytics 4 та Meta Pixel з налаштуванням подій.

## Критерії успіху
- [ ] GA4 відстежує перегляди сторінок
- [ ] GA4 відстежує custom events (пошук шин, перехід до дилерів)
- [ ] Meta Pixel встановлено
- [ ] Meta Pixel відстежує ViewContent, кліки по CTA
- [ ] ID лічильників керуються через env змінні

## Фази роботи
1. **GA4 інтеграція** — базовий код, pageviews, events
2. **Meta Pixel** — встановлення, події
3. **Тестування** — перевірка в debug режимі

## Джерело вимог
`01_TZ_Bridgestone_site.md` — пункт 6.1 "Веб-аналітика"

## Env змінні
```env
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXX
```

## Початок роботи
Для початку або продовження роботи прочитай PROGRESS.md
