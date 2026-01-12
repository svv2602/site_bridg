/**
 * Generate Blog Articles
 *
 * Creates seasonal guides and tyre-related articles using DeepSeek/OpenAI
 */

import { createDeepSeekProvider } from "./providers/index.js";
import { getPayloadClient } from "./publishers/payload-client.js";

const ARTICLE_PROMPTS = {
  winterGuide: `Напиши статтю для блогу українською мовою на тему "Як обрати зимові шини: повний гід ${new Date().getFullYear()}".

Структура статті:
1. Вступ - чому важливо обирати правильні зимові шини
2. Типи зимових шин (шиповані vs фрикційні)
3. На що звертати увагу при виборі (розмір, індекси навантаження та швидкості)
4. EU-маркування шин (паливна ефективність, гальмування на мокрій поверхні, шум)
5. Топ моделі Bridgestone для зими (Blizzak LM005, Blizzak 6)
6. Поради по догляду за зимовими шинами
7. Висновок

Відповідь у форматі JSON:
{
  "title": "заголовок статті",
  "subtitle": "підзаголовок",
  "body": "HTML контент статті з тегами <h2>, <h3>, <p>, <ul>, <li>, <strong>",
  "previewText": "короткий опис до 200 символів",
  "tags": ["зимові шини", "вибір шин", "Bridgestone"],
  "seoTitle": "SEO заголовок до 60 символів",
  "seoDescription": "SEO опис до 160 символів"
}`,

  summerGuide: `Напиши статтю для блогу українською мовою на тему "Літні шини ${new Date().getFullYear()}: як обрати найкращі для вашого авто".

Структура статті:
1. Вступ - переваги літніх шин над всесезонними влітку
2. Ключові характеристики літніх шин
3. Типи літніх шин (туринг, спортивні, SUV)
4. EU-маркування та що означають показники
5. Топ моделі Bridgestone для літа (Turanza 6, Potenza Sport, Ecopia)
6. Коли міняти літні шини
7. Висновок

Відповідь у форматі JSON:
{
  "title": "заголовок статті",
  "subtitle": "підзаголовок",
  "body": "HTML контент статті з тегами <h2>, <h3>, <p>, <ul>, <li>, <strong>",
  "previewText": "короткий опис до 200 символів",
  "tags": ["літні шини", "вибір шин", "Bridgestone"],
  "seoTitle": "SEO заголовок до 60 символів",
  "seoDescription": "SEO опис до 160 символів"
}`,

  tyreCare: `Напиши статтю для блогу українською мовою на тему "Догляд за шинами: як продовжити термін служби".

Структура статті:
1. Вступ - чому важливий правильний догляд за шинами
2. Перевірка тиску - як часто і як правильно
3. Візуальний огляд - на що звертати увагу
4. Ротація шин - навіщо і як часто
5. Балансування та розвал-сходження
6. Зберігання шин поза сезоном
7. Коли міняти шини - ознаки зносу
8. Висновок

Відповідь у форматі JSON:
{
  "title": "заголовок статті",
  "subtitle": "підзаголовок",
  "body": "HTML контент статті з тегами <h2>, <h3>, <p>, <ul>, <li>, <strong>",
  "previewText": "короткий опис до 200 символів",
  "tags": ["догляд за шинами", "поради", "безпека"],
  "seoTitle": "SEO заголовок до 60 символів",
  "seoDescription": "SEO опис до 160 символів"
}`
};

interface GeneratedArticle {
  title: string;
  subtitle?: string;
  body: string;
  previewText: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
}

function parseArticleResponse(response: string): GeneratedArticle | null {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("Failed to parse article response:", error);
  }
  return null;
}

function generateSlug(title: string): string {
  const translitMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye',
    'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l',
    'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu',
    'я': 'ya'
  };

  return title
    .toLowerCase()
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

async function generateArticle(promptKey: keyof typeof ARTICLE_PROMPTS): Promise<GeneratedArticle | null> {
  const prompt = ARTICLE_PROMPTS[promptKey];

  console.log(`\nGenerating article: ${promptKey}...`);

  const provider = createDeepSeekProvider();

  try {
    const result = await provider.generateChat([
      { role: "user", content: prompt }
    ], {
      maxTokens: 3000,
      temperature: 0.7,
    });

    if (!result.content) {
      console.error(`Failed to generate ${promptKey}: empty response`);
      return null;
    }

    const article = parseArticleResponse(result.content);
    if (!article) {
      console.error(`Failed to parse ${promptKey} response`);
      return null;
    }

    console.log(`  ✓ Generated: ${article.title}`);
    return article;
  } catch (error) {
    console.error(`Failed to generate ${promptKey}:`, error);
    return null;
  }
}

async function publishArticle(article: GeneratedArticle, slug: string) {
  const client = getPayloadClient();
  await client.authenticate();

  // Check if article exists
  const existing = await client.findArticleBySlug(slug);

  const articleData = {
    slug,
    title: article.title,
    subtitle: article.subtitle,
    body: article.body,
    previewText: article.previewText.substring(0, 300),
    tags: article.tags.map(tag => ({ tag })),
    seoTitle: article.seoTitle?.substring(0, 70),
    seoDescription: article.seoDescription?.substring(0, 170),
    readingTimeMinutes: Math.ceil(article.body.split(/\s+/).length / 200),
  };

  if (existing) {
    await client.updateArticle(existing.id, articleData);
    console.log(`  ✓ Updated article: ${slug}`);
  } else {
    await client.createArticle(articleData);
    console.log(`  ✓ Created article: ${slug}`);
  }
}

async function main() {
  console.log("=".repeat(50));
  console.log("Article Generation");
  console.log("=".repeat(50));

  const articles: Array<{ key: keyof typeof ARTICLE_PROMPTS; slugPrefix: string }> = [
    { key: "winterGuide", slugPrefix: "winter-tyres-guide" },
    { key: "summerGuide", slugPrefix: "summer-tyres-guide" },
    { key: "tyreCare", slugPrefix: "tyre-care-guide" },
  ];

  for (const { key, slugPrefix } of articles) {
    const article = await generateArticle(key);

    if (article) {
      const slug = `${slugPrefix}-${new Date().getFullYear()}`;
      await publishArticle(article, slug);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Done!");
}

main().catch(console.error);
