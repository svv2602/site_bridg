import { getArticles } from "@/lib/api/articles";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await getArticles();

  // Sort by publishedAt descending
  const sorted = [...articles].sort((a, b) => {
    const da = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const db = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return db - da;
  });

  const items = sorted
    .slice(0, 50)
    .map((article) => {
      const pubDate = article.publishedAt
        ? new Date(article.publishedAt).toUTCString()
        : new Date().toUTCString();

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${SITE_URL}/blog/${escapeXml(article.slug)}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${escapeXml(article.slug)}</guid>
      <description>${escapeXml(article.previewText)}</description>
      <pubDate>${pubDate}</pubDate>
      ${article.tags?.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ") || ""}
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} — Блог</title>
    <link>${SITE_URL}/blog</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>uk</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
