/**
 * Lexical ↔ HTML Synchronization Utilities
 *
 * Converts between Lexical JSON and HTML for two-way editing.
 */

// Lexical node types
interface LexicalTextNode {
  type: 'text';
  text: string;
  format?: number;
}

interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  tag?: string;
  text?: string;
  format?: number;
  listType?: string;
  value?: number;
}

interface LexicalRoot {
  root: {
    children: LexicalNode[];
  };
}

/**
 * Convert Lexical JSON to HTML
 */
export function lexicalToHtml(lexical: LexicalRoot | null | undefined): string {
  if (!lexical?.root?.children) {
    return '';
  }

  return lexical.root.children.map(nodeToHtml).join('\n\n');
}

function nodeToHtml(node: LexicalNode): string {
  switch (node.type) {
    case 'paragraph':
      const pContent = node.children?.map(childToHtml).join('') || '';
      return pContent ? `<p>${pContent}</p>` : '';

    case 'heading':
      const tag = node.tag || 'h2';
      const hContent = node.children?.map(childToHtml).join('') || '';
      return `<${tag}>${hContent}</${tag}>`;

    case 'list':
      const listTag = node.listType === 'number' ? 'ol' : 'ul';
      const items = node.children?.map(nodeToHtml).join('\n') || '';
      return `<${listTag}>\n${items}\n</${listTag}>`;

    case 'listitem':
      const liContent = node.children?.map(childToHtml).join('') || '';
      return `  <li>${liContent}</li>`;

    case 'horizontalrule':
      return '<hr>';

    case 'upload':
      // Handle uploaded images
      const uploadNode = node as any;
      if (uploadNode.value?.url) {
        const caption = uploadNode.fields?.caption || uploadNode.value?.alt || '';
        return `<figure><img src="${uploadNode.value.url}" alt="${caption}">${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
      }
      return '';

    default:
      if (node.children) {
        return node.children.map(nodeToHtml).join('');
      }
      return '';
  }
}

function childToHtml(node: LexicalNode): string {
  if (node.type === 'text') {
    let text = node.text || '';
    const format = node.format || 0;

    // Format flags: 1=bold, 2=italic, 4=underline, 8=strikethrough
    if (format & 1) text = `<strong>${text}</strong>`;
    if (format & 2) text = `<em>${text}</em>`;
    if (format & 4) text = `<u>${text}</u>`;
    if (format & 8) text = `<s>${text}</s>`;

    return text;
  }

  if (node.type === 'link') {
    const linkNode = node as any;
    const href = linkNode.fields?.url || '#';
    const content = node.children?.map(childToHtml).join('') || '';
    return `<a href="${href}">${content}</a>`;
  }

  return nodeToHtml(node);
}

/**
 * Convert HTML to Lexical JSON
 */
export function htmlToLexical(html: string): LexicalRoot {
  const children: LexicalNode[] = [];

  if (!html || !html.trim()) {
    return createEmptyLexical();
  }

  // Simple regex-based parsing (for basic HTML)
  const blocks = html.split(/(?=<(?:p|h[1-6]|ul|ol|hr|figure)[^>]*>)/gi).filter(Boolean);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Headings
    const headingMatch = trimmed.match(/^<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/i);
    if (headingMatch) {
      children.push(createHeadingNode(headingMatch[1], parseInlineHtml(headingMatch[2])));
      continue;
    }

    // Paragraphs
    const pMatch = trimmed.match(/^<p[^>]*>([\s\S]*?)<\/p>/i);
    if (pMatch) {
      const content = parseInlineHtml(pMatch[1]);
      if (content.length > 0) {
        children.push(createParagraphNode(content));
      }
      continue;
    }

    // Unordered lists
    const ulMatch = trimmed.match(/^<ul[^>]*>([\s\S]*?)<\/ul>/i);
    if (ulMatch) {
      children.push(createListNode(ulMatch[1], 'bullet'));
      continue;
    }

    // Ordered lists
    const olMatch = trimmed.match(/^<ol[^>]*>([\s\S]*?)<\/ol>/i);
    if (olMatch) {
      children.push(createListNode(olMatch[1], 'number'));
      continue;
    }

    // Horizontal rule
    if (trimmed.match(/^<hr\s*\/?>/i)) {
      children.push({ type: 'horizontalrule', version: 1 } as any);
      continue;
    }

    // Plain text (wrap in paragraph)
    const plainText = trimmed.replace(/<[^>]+>/g, '').trim();
    if (plainText) {
      children.push(createParagraphNode([createTextNode(plainText)]));
    }
  }

  if (children.length === 0) {
    return createEmptyLexical();
  }

  return {
    root: {
      type: 'root',
      version: 1,
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
    } as any,
  };
}

function createEmptyLexical(): LexicalRoot {
  return {
    root: {
      type: 'root',
      version: 1,
      children: [],
      direction: 'ltr',
      format: '',
      indent: 0,
    } as any,
  };
}

function createTextNode(text: string, format: number = 0): LexicalNode {
  return {
    type: 'text',
    version: 1,
    text,
    format,
    mode: 'normal',
    style: '',
  } as any;
}

function createParagraphNode(children: LexicalNode[]): LexicalNode {
  return {
    type: 'paragraph',
    version: 1,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
  } as any;
}

function createHeadingNode(tag: string, children: LexicalNode[]): LexicalNode {
  return {
    type: 'heading',
    version: 1,
    tag,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
  } as any;
}

function createListNode(html: string, listType: 'bullet' | 'number'): LexicalNode {
  const items: LexicalNode[] = [];
  const liMatches = html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);

  let index = 1;
  for (const match of liMatches) {
    items.push({
      type: 'listitem',
      version: 1,
      children: parseInlineHtml(match[1]),
      direction: 'ltr',
      format: '',
      indent: 0,
      value: index++,
    } as any);
  }

  return {
    type: 'list',
    version: 1,
    listType,
    children: items,
    direction: 'ltr',
    format: '',
    indent: 0,
    start: 1,
    tag: listType === 'bullet' ? 'ul' : 'ol',
  } as any;
}

function parseInlineHtml(html: string): LexicalNode[] {
  const nodes: LexicalNode[] = [];
  let remaining = html;

  // Pattern for inline elements
  const inlinePattern = /<(strong|b|em|i|u|s|a)([^>]*)>([\s\S]*?)<\/\1>/gi;

  let lastIndex = 0;
  let match;
  const tempHtml = html;
  const regex = new RegExp(inlinePattern);

  while ((match = regex.exec(tempHtml)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      const textBefore = tempHtml.slice(lastIndex, match.index).replace(/<[^>]+>/g, '');
      if (textBefore) {
        nodes.push(createTextNode(textBefore));
      }
    }

    const tag = match[1].toLowerCase();
    const content = match[3].replace(/<[^>]+>/g, '');

    let format = 0;
    if (tag === 'strong' || tag === 'b') format = 1;
    if (tag === 'em' || tag === 'i') format = 2;
    if (tag === 'u') format = 4;
    if (tag === 's') format = 8;

    nodes.push(createTextNode(content, format));
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < tempHtml.length) {
    const textAfter = tempHtml.slice(lastIndex).replace(/<[^>]+>/g, '');
    if (textAfter) {
      nodes.push(createTextNode(textAfter));
    }
  }

  // If no inline elements found, just return plain text
  if (nodes.length === 0) {
    const plainText = html.replace(/<[^>]+>/g, '').trim();
    if (plainText) {
      nodes.push(createTextNode(plainText));
    }
  }

  return nodes;
}

/**
 * Check if HTML content has changed (ignoring whitespace)
 */
export function hasHtmlChanged(oldHtml: string | null | undefined, newHtml: string | null | undefined): boolean {
  const normalize = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim();
  return normalize(oldHtml) !== normalize(newHtml);
}

/**
 * Check if Lexical content has changed
 */
export function hasLexicalChanged(oldLexical: any, newLexical: any): boolean {
  return JSON.stringify(oldLexical) !== JSON.stringify(newLexical);
}
