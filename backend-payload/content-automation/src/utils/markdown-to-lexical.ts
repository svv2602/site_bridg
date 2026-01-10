/**
 * Markdown to Lexical Converter
 *
 * Converts Markdown content to Lexical JSON structure for Payload CMS richText fields.
 */

/**
 * Lexical node types
 */
interface LexicalTextNode {
  type: "text";
  version: 1;
  text: string;
  format: number; // 0 = normal, 1 = bold, 2 = italic, 3 = bold+italic
  mode: "normal";
  style: "";
}

interface LexicalParagraphNode {
  type: "paragraph";
  version: 1;
  children: LexicalTextNode[];
  direction: "ltr";
  format: "";
  indent: 0;
  textFormat: 0;
}

interface LexicalHeadingNode {
  type: "heading";
  version: 1;
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: LexicalTextNode[];
  direction: "ltr";
  format: "";
  indent: 0;
}

interface LexicalListItemNode {
  type: "listitem";
  version: 1;
  children: LexicalTextNode[];
  direction: "ltr";
  format: "";
  indent: 0;
  value: number;
}

interface LexicalListNode {
  type: "list";
  version: 1;
  listType: "bullet" | "number";
  children: LexicalListItemNode[];
  direction: "ltr";
  format: "";
  indent: 0;
  start: 1;
  tag: "ul" | "ol";
}

type LexicalNode =
  | LexicalParagraphNode
  | LexicalHeadingNode
  | LexicalListNode;

interface LexicalRoot {
  root: {
    type: "root";
    version: 1;
    children: LexicalNode[];
    direction: "ltr";
    format: "";
    indent: 0;
  };
}

/**
 * Parse inline formatting (bold, italic)
 */
function parseInlineFormatting(text: string): LexicalTextNode[] {
  const nodes: LexicalTextNode[] = [];

  // Simple regex-based parsing for **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  for (const part of parts) {
    if (!part) continue;

    let format = 0;
    let content = part;

    if (part.startsWith("**") && part.endsWith("**")) {
      format = 1; // bold
      content = part.slice(2, -2);
    } else if (part.startsWith("*") && part.endsWith("*")) {
      format = 2; // italic
      content = part.slice(1, -1);
    }

    if (content) {
      nodes.push({
        type: "text",
        version: 1,
        text: content,
        format,
        mode: "normal",
        style: "",
      });
    }
  }

  return nodes.length > 0 ? nodes : [createTextNode(text)];
}

/**
 * Create a simple text node
 */
function createTextNode(text: string, format: number = 0): LexicalTextNode {
  return {
    type: "text",
    version: 1,
    text,
    format,
    mode: "normal",
    style: "",
  };
}

/**
 * Create a paragraph node
 */
function createParagraphNode(text: string): LexicalParagraphNode {
  return {
    type: "paragraph",
    version: 1,
    children: parseInlineFormatting(text),
    direction: "ltr",
    format: "",
    indent: 0,
    textFormat: 0,
  };
}

/**
 * Create a heading node
 */
function createHeadingNode(
  text: string,
  level: 1 | 2 | 3 | 4 | 5 | 6
): LexicalHeadingNode {
  return {
    type: "heading",
    version: 1,
    tag: `h${level}`,
    children: parseInlineFormatting(text),
    direction: "ltr",
    format: "",
    indent: 0,
  };
}

/**
 * Create a list item node
 */
function createListItemNode(text: string, value: number): LexicalListItemNode {
  return {
    type: "listitem",
    version: 1,
    children: parseInlineFormatting(text),
    direction: "ltr",
    format: "",
    indent: 0,
    value,
  };
}

/**
 * Create a list node
 */
function createListNode(
  items: string[],
  listType: "bullet" | "number"
): LexicalListNode {
  return {
    type: "list",
    version: 1,
    listType,
    children: items.map((item, index) =>
      createListItemNode(item, index + 1)
    ),
    direction: "ltr",
    format: "",
    indent: 0,
    start: 1,
    tag: listType === "bullet" ? "ul" : "ol",
  };
}

/**
 * Convert Markdown string to Lexical JSON
 */
export function markdownToLexical(markdown: string): LexicalRoot {
  const lines = markdown.split("\n");
  const nodes: LexicalNode[] = [];

  let currentList: { type: "bullet" | "number"; items: string[] } | null = null;

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      nodes.push(createListNode(currentList.items, currentList.type));
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      flushList();
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      const text = headingMatch[2];
      nodes.push(createHeadingNode(text, level));
      continue;
    }

    // Bullet list items
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== "bullet") {
        flushList();
        currentList = { type: "bullet", items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // Numbered list items
    const numberMatch = line.match(/^\d+\.\s+(.+)$/);
    if (numberMatch) {
      if (!currentList || currentList.type !== "number") {
        flushList();
        currentList = { type: "number", items: [] };
      }
      currentList.items.push(numberMatch[1]);
      continue;
    }

    // Regular paragraph
    flushList();
    nodes.push(createParagraphNode(line));
  }

  // Flush any remaining list
  flushList();

  return {
    root: {
      type: "root",
      version: 1,
      children: nodes,
      direction: "ltr",
      format: "",
      indent: 0,
    },
  };
}

/**
 * Convert Lexical JSON back to Markdown (for debugging)
 */
export function lexicalToMarkdown(lexical: LexicalRoot): string {
  const lines: string[] = [];

  function textNodesToString(nodes: LexicalTextNode[]): string {
    return nodes
      .map((node) => {
        let text = node.text;
        if (node.format === 1) text = `**${text}**`;
        if (node.format === 2) text = `*${text}*`;
        if (node.format === 3) text = `***${text}***`;
        return text;
      })
      .join("");
  }

  for (const node of lexical.root.children) {
    switch (node.type) {
      case "heading":
        const hashes = "#".repeat(parseInt(node.tag[1]));
        lines.push(`${hashes} ${textNodesToString(node.children)}`);
        break;

      case "paragraph":
        lines.push(textNodesToString(node.children));
        break;

      case "list":
        for (let i = 0; i < node.children.length; i++) {
          const item = node.children[i];
          const prefix = node.listType === "bullet" ? "-" : `${i + 1}.`;
          lines.push(`${prefix} ${textNodesToString(item.children)}`);
        }
        break;
    }

    lines.push(""); // Empty line between blocks
  }

  return lines.join("\n").trim();
}

/**
 * Validate Lexical structure
 */
export function validateLexical(lexical: unknown): boolean {
  if (!lexical || typeof lexical !== "object") return false;

  const obj = lexical as Record<string, unknown>;
  if (!obj.root || typeof obj.root !== "object") return false;

  const root = obj.root as Record<string, unknown>;
  if (root.type !== "root" || !Array.isArray(root.children)) return false;

  return true;
}

// CLI test
if (process.argv[1]?.includes("markdown-to-lexical.ts")) {
  const testMarkdown = `# Main Title

This is an introduction paragraph with **bold text** and *italic text*.

## Section One

Here is some content for section one.

- First bullet point
- Second bullet point
- Third bullet point

## Section Two

Here is a numbered list:

1. First item
2. Second item
3. Third item

Final paragraph with **important** information.
`;

  console.log("=== INPUT MARKDOWN ===");
  console.log(testMarkdown);

  const lexical = markdownToLexical(testMarkdown);
  console.log("\n=== LEXICAL JSON ===");
  console.log(JSON.stringify(lexical, null, 2));

  const backToMarkdown = lexicalToMarkdown(lexical);
  console.log("\n=== BACK TO MARKDOWN ===");
  console.log(backToMarkdown);
}
