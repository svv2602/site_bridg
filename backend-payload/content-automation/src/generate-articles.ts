/**
 * Generate Blog Articles with Images
 *
 * Creates seasonal guides and tyre-related articles using DeepSeek/OpenAI
 * Generates and integrates hero and content images using DALL-E
 */

import { createDeepSeekProvider } from "./providers/index.js";
import { getPayloadClient } from "./publishers/payload-client.js";
import { generateHeroImage, generateContentImages, type ImageType } from "./processors/content/article-images.js";
import { createLogger } from "./utils/logger.js";

const logger = createLogger("ArticleGenerator");

const ARTICLE_PROMPTS = {
  winterGuide: {
    season: "winter" as const,
    prompt: `Напиши статтю для блогу українською мовою на тему "Як обрати зимові шини: повний гід ${new Date().getFullYear()}".

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
  "body": "HTML контент статті з тегами <h2>, <h3>, <p>, <ul>, <li>, <strong>. Після кожної секції <h2> залишай місце для зображення коментарем <!-- IMAGE_PLACEHOLDER -->",
  "previewText": "короткий опис до 200 символів",
  "tags": ["зимові шини", "вибір шин", "Bridgestone"],
  "seoTitle": "SEO заголовок до 60 символів",
  "seoDescription": "SEO опис до 160 символів",
  "imageContexts": ["контекст для зображення 1", "контекст для зображення 2"]
}`
  },

  summerGuide: {
    season: "summer" as const,
    prompt: `Напиши статтю для блогу українською мовою на тему "Літні шини ${new Date().getFullYear()}: як обрати найкращі для вашого авто".

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
  "body": "HTML контент статті з тегами <h2>, <h3>, <p>, <ul>, <li>, <strong>. Після кожної секції <h2> залишай місце для зображення коментарем <!-- IMAGE_PLACEHOLDER -->",
  "previewText": "короткий опис до 200 символів",
  "tags": ["літні шини", "вибір шин", "Bridgestone"],
  "seoTitle": "SEO заголовок до 60 символів",
  "seoDescription": "SEO опис до 160 символів",
  "imageContexts": ["контекст для зображення 1", "контекст для зображення 2"]
}`
  },

  tyreCare: {
    season: "allseason" as const,
    prompt: `Напиши статтю для блогу українською мовою на тему "Догляд за шинами: як продовжити термін служби".

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
  "body": "HTML контент статті з тегами <h2>, <h3>, <p>, <ul>, <li>, <strong>. Після кожної секції <h2> залишай місце для зображення коментарем <!-- IMAGE_PLACEHOLDER -->",
  "previewText": "короткий опис до 200 символів",
  "tags": ["догляд за шинами", "поради", "безпека"],
  "seoTitle": "SEO заголовок до 60 символів",
  "seoDescription": "SEO опис до 160 символів",
  "imageContexts": ["контекст для зображення 1", "контекст для зображення 2"]
}`
  }
};

interface GeneratedArticle {
  title: string;
  subtitle?: string;
  body: string;
  previewText: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  imageContexts?: string[];
}

function parseArticleResponse(response: string): GeneratedArticle | null {
  try {
    // Try to find JSON block (may be wrapped in markdown code block)
    let jsonStr = response;

    // Remove markdown code blocks if present (greedy match to last ```)
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    // Find JSON object - use greedy match for nested braces
    const jsonMatch = jsonStr.match(/(\{[\s\S]*\})\s*$/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    console.error("No JSON found. Response length:", response.length);
    console.error("First 200 chars:", response.slice(0, 200));
    console.error("Last 200 chars:", response.slice(-200));
  } catch (error) {
    console.error("Failed to parse article response:", error);
    console.error("Response snippet:", response.slice(0, 1000));
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

/**
 * Insert images into HTML body
 * Replaces <!-- IMAGE_PLACEHOLDER --> comments with <figure> elements
 */
function insertImagesIntoBody(body: string, imageUrls: string[], alts: string[]): string {
  let result = body;
  let imageIndex = 0;

  // Replace each placeholder with an image
  while (result.includes('<!-- IMAGE_PLACEHOLDER -->') && imageIndex < imageUrls.length) {
    const imageHtml = `
<figure class="article-image">
  <img src="${imageUrls[imageIndex]}" alt="${alts[imageIndex] || 'Ілюстрація до статті'}" loading="lazy" />
</figure>`;
    result = result.replace('<!-- IMAGE_PLACEHOLDER -->', imageHtml);
    imageIndex++;
  }

  // Remove any remaining placeholders
  result = result.replace(/<!-- IMAGE_PLACEHOLDER -->/g, '');

  return result;
}

async function generateArticle(promptKey: keyof typeof ARTICLE_PROMPTS): Promise<{
  article: GeneratedArticle;
  season: "summer" | "winter" | "allseason";
} | null> {
  const { prompt, season } = ARTICLE_PROMPTS[promptKey];

  logger.info(`Generating article: ${promptKey}...`);

  const provider = createDeepSeekProvider();

  try {
    const result = await provider.generateChat([
      { role: "user", content: prompt }
    ], {
      maxTokens: 5000,
      temperature: 0.7,
    });

    if (!result.content) {
      logger.error(`Failed to generate ${promptKey}: empty response`);
      return null;
    }

    const article = parseArticleResponse(result.content);
    if (!article) {
      logger.error(`Failed to parse ${promptKey} response`);
      return null;
    }

    logger.info(`Generated: ${article.title}`);
    return { article, season };
  } catch (error) {
    logger.error(`Failed to generate ${promptKey}:`, { error });
    return null;
  }
}

async function generateAndUploadImages(
  topic: string,
  season: "summer" | "winter" | "allseason",
  contexts: string[],
  client: ReturnType<typeof getPayloadClient>
): Promise<{
  heroImageId: number | null;
  contentImageUrls: string[];
  contentImageAlts: string[];
}> {
  const result = {
    heroImageId: null as number | null,
    contentImageUrls: [] as string[],
    contentImageAlts: [] as string[],
  };

  try {
    // Generate hero image
    logger.info("Generating hero image...");
    const heroImage = await generateHeroImage(topic, season);

    if (heroImage.url) {
      // Download and upload to Payload
      const uploadResult = await client.uploadImageFromUrl(heroImage.url, {
        alt: heroImage.alt,
        filename: `article-hero-${generateSlug(topic)}.png`,
      });

      if (uploadResult) {
        result.heroImageId = uploadResult.id;
        logger.info(`Hero image uploaded: ID ${uploadResult.id}`);
      }
    }

    // Generate content images (2-3 images)
    const contentCount = Math.min(contexts.length || 2, 3);
    logger.info(`Generating ${contentCount} content images...`);

    const contentImages = await generateContentImages(topic, contentCount, {
      contexts: contexts.slice(0, contentCount),
    });

    for (const img of contentImages) {
      if (img.url) {
        // Upload each content image
        const uploadResult = await client.uploadImageFromUrl(img.url, {
          alt: img.alt,
          filename: `article-content-${generateSlug(topic)}-${result.contentImageUrls.length + 1}.png`,
        });

        if (uploadResult) {
          // Use full URL from Payload
          result.contentImageUrls.push(uploadResult.url);
          result.contentImageAlts.push(img.alt);
          logger.info(`Content image uploaded: ID ${uploadResult.id}`);
        }
      }
    }
  } catch (error) {
    logger.error("Image generation failed:", { error });
  }

  return result;
}

async function publishArticle(
  article: GeneratedArticle,
  slug: string,
  heroImageId: number | null,
  contentImageUrls: string[],
  contentImageAlts: string[]
) {
  const client = getPayloadClient();
  await client.authenticate();

  // Insert content images into body
  let body = article.body;
  if (contentImageUrls.length > 0) {
    body = insertImagesIntoBody(body, contentImageUrls, contentImageAlts);
    logger.info(`Inserted ${contentImageUrls.length} images into body`);
  }

  // Check if article exists
  const existing = await client.findArticleBySlug(slug);

  const articleData = {
    slug,
    title: article.title,
    subtitle: article.subtitle,
    body,
    previewText: article.previewText.substring(0, 300),
    tags: article.tags.map(tag => ({ tag })),
    seoTitle: article.seoTitle?.substring(0, 70),
    seoDescription: article.seoDescription?.substring(0, 170),
    readingTimeMinutes: Math.ceil(article.body.split(/\s+/).length / 200),
    ...(heroImageId && { image: heroImageId }),
  };

  if (existing) {
    await client.updateArticle(existing.id, articleData);
    logger.info(`Updated article: ${slug}`);
  } else {
    await client.createArticle(articleData);
    logger.info(`Created article: ${slug}`);
  }
}

interface GenerateOptions {
  skipImages?: boolean;
  articlesFilter?: (keyof typeof ARTICLE_PROMPTS)[];
}

async function main(options: GenerateOptions = {}) {
  console.log("=".repeat(50));
  console.log("Article Generation with Images");
  console.log("=".repeat(50));

  const client = getPayloadClient();
  await client.authenticate();

  const articles: Array<{ key: keyof typeof ARTICLE_PROMPTS; slugPrefix: string }> = [
    { key: "winterGuide", slugPrefix: "winter-tyres-guide" },
    { key: "summerGuide", slugPrefix: "summer-tyres-guide" },
    { key: "tyreCare", slugPrefix: "tyre-care-guide" },
  ];

  // Filter articles if specified
  const articlesToGenerate = options.articlesFilter
    ? articles.filter(a => options.articlesFilter!.includes(a.key))
    : articles;

  for (const { key, slugPrefix } of articlesToGenerate) {
    console.log(`\n--- ${key} ---`);

    const result = await generateArticle(key);

    if (result) {
      const { article, season } = result;
      const slug = `${slugPrefix}-${new Date().getFullYear()}`;

      let heroImageId: number | null = null;
      let contentImageUrls: string[] = [];
      let contentImageAlts: string[] = [];

      // Generate images unless skipped
      if (!options.skipImages) {
        const images = await generateAndUploadImages(
          article.title,
          season,
          article.imageContexts || [],
          client
        );
        heroImageId = images.heroImageId;
        contentImageUrls = images.contentImageUrls;
        contentImageAlts = images.contentImageAlts;
      }

      await publishArticle(article, slug, heroImageId, contentImageUrls, contentImageAlts);
      console.log(`  ✓ Published: ${slug}`);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Done!");
}

// Parse CLI args
const args = process.argv.slice(2);
const skipImages = args.includes("--skip-images") || args.includes("--text-only");
const filterArg = args.find(a => a.startsWith("--only="));
const articlesFilter = filterArg
  ? filterArg.split("=")[1].split(",") as (keyof typeof ARTICLE_PROMPTS)[]
  : undefined;

main({ skipImages, articlesFilter }).catch(console.error);
