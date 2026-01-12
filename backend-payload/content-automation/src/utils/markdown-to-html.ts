/**
 * Simple Markdown to HTML Converter
 *
 * Converts basic markdown formatting to HTML tags.
 * Supports: headings, bold, italic, lists, paragraphs.
 */

/**
 * Convert Markdown string to HTML
 */
export function markdownToHtml(markdown: string): string {
  const lines = markdown.split('\n');
  const htmlParts: string[] = [];

  let inList: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      const tag = inList;
      const items = listItems.map(item => `  <li>${item}</li>`).join('\n');
      htmlParts.push(`<${tag}>\n${items}\n</${tag}>`);
      listItems = [];
      inList = null;
    }
  };

  const processInline = (text: string): string => {
    // Bold: **text** or __text__
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Italic: *text* or _text_
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Links: [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    return text;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      flushList();
      continue;
    }

    // Headings: # ## ### etc.
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const text = processInline(headingMatch[2]);
      htmlParts.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    // Bullet list: - or *
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (inList !== 'ul') {
        flushList();
        inList = 'ul';
      }
      listItems.push(processInline(bulletMatch[1]));
      continue;
    }

    // Numbered list: 1. 2. etc.
    const numberMatch = line.match(/^\d+\.\s+(.+)$/);
    if (numberMatch) {
      if (inList !== 'ol') {
        flushList();
        inList = 'ol';
      }
      listItems.push(processInline(numberMatch[1]));
      continue;
    }

    // Horizontal rule: --- or ***
    if (line.match(/^(---|\*\*\*)$/)) {
      flushList();
      htmlParts.push('<hr>');
      continue;
    }

    // Regular paragraph
    flushList();
    htmlParts.push(`<p>${processInline(line)}</p>`);
  }

  // Flush any remaining list
  flushList();

  return htmlParts.join('\n\n');
}

/**
 * Sanitize HTML - remove potentially dangerous tags
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove onclick and other event handlers
  html = html.replace(/\son\w+="[^"]*"/gi, '');
  html = html.replace(/\son\w+='[^']*'/gi, '');

  // Remove javascript: links
  html = html.replace(/href="javascript:[^"]*"/gi, 'href="#"');

  return html;
}

// Test if run directly
if (process.argv[1]?.includes('markdown-to-html')) {
  const testMarkdown = `# Основний заголовок

Це **жирний текст** та *курсив*.

## Підзаголовок

Ось список переваг:

- Перша перевага
- Друга перевага
- Третя перевага

### Нумерований список

1. Крок перший
2. Крок другий
3. Крок третій

Фінальний параграф з [посиланням](https://example.com).
`;

  console.log('=== INPUT MARKDOWN ===');
  console.log(testMarkdown);

  const html = markdownToHtml(testMarkdown);
  console.log('\n=== OUTPUT HTML ===');
  console.log(html);
}
