/**
 * Rich Text Renderer Component
 *
 * Renders rich text content - supports both:
 * - Lexical JSON format (legacy)
 * - HTML strings from CKEditor (current)
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";

// Lexical Node Types
interface LexicalTextNode {
  type: "text";
  text: string;
  format?: number;
}

interface LexicalLinkNode {
  type: "link";
  url: string;
  children: LexicalNode[];
}

interface LexicalListItemNode {
  type: "listitem";
  children: LexicalNode[];
}

interface LexicalListNode {
  type: "list";
  listType: "bullet" | "number";
  children: LexicalListItemNode[];
}

interface LexicalHeadingNode {
  type: "heading";
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: LexicalNode[];
}

interface LexicalParagraphNode {
  type: "paragraph";
  children: LexicalNode[];
}

interface LexicalImageNode {
  type: "image" | "upload";
  src?: string;
  url?: string;
  value?: { url?: string; alt?: string; width?: number; height?: number };
  altText?: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
}

type LexicalNode =
  | LexicalTextNode
  | LexicalLinkNode
  | LexicalListItemNode
  | LexicalListNode
  | LexicalHeadingNode
  | LexicalParagraphNode
  | LexicalImageNode;

interface LexicalRoot {
  root: {
    children: LexicalNode[];
    type: "root";
  };
}

type ProseVariant = "default" | "article" | "product" | "minimal";

interface LexicalRendererProps {
  content: LexicalRoot | string | null | undefined;
  className?: string;
  /** Style variant: article, product (clean), minimal, default */
  variant?: ProseVariant;
  /** Lead paragraph (larger first paragraph) */
  leadParagraph?: boolean;
}

// Text format bitmasks
const TEXT_FORMAT = {
  BOLD: 1,
  ITALIC: 2,
  UNDERLINE: 4,
  STRIKETHROUGH: 8,
};

function renderTextNode(node: LexicalTextNode, key: string) {
  let element: React.ReactNode = node.text;
  const format = node.format || 0;

  if (format & TEXT_FORMAT.BOLD) {
    element = <strong key={`${key}-bold`}>{element}</strong>;
  }
  if (format & TEXT_FORMAT.ITALIC) {
    element = <em key={`${key}-italic`}>{element}</em>;
  }
  if (format & TEXT_FORMAT.UNDERLINE) {
    element = <u key={`${key}-underline`}>{element}</u>;
  }
  if (format & TEXT_FORMAT.STRIKETHROUGH) {
    element = <s key={`${key}-strike`}>{element}</s>;
  }

  return <span key={key}>{element}</span>;
}

function renderChildren(children: LexicalNode[], keyPrefix: string): React.ReactNode[] {
  return children.map((child, index) => {
    const key = `${keyPrefix}-${index}`;

    switch (child.type) {
      case "text":
        return renderTextNode(child, key);

      case "link":
        const isExternal = child.url.startsWith("http");
        if (isExternal) {
          return (
            <a
              key={key}
              href={child.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 underline hover:text-stone-900 hover:no-underline dark:text-stone-300 dark:hover:text-stone-100"
            >
              {renderChildren(child.children, key)}
            </a>
          );
        }
        return (
          <Link key={key} href={child.url} className="text-stone-600 underline hover:text-stone-900 hover:no-underline dark:text-stone-300 dark:hover:text-stone-100">
            {renderChildren(child.children, key)}
          </Link>
        );

      case "paragraph":
        return (
          <p key={key} className="mb-4 last:mb-0">
            {renderChildren(child.children, key)}
          </p>
        );

      case "heading":
        const HeadingTag = child.tag;
        const headingClasses = {
          h1: "text-3xl font-bold mb-4",
          h2: "text-2xl font-bold mb-3",
          h3: "text-xl font-semibold mb-2",
          h4: "text-lg font-semibold mb-2",
          h5: "text-base font-semibold mb-2",
          h6: "text-sm font-semibold mb-2",
        };
        return (
          <HeadingTag key={key} className={headingClasses[child.tag]}>
            {renderChildren(child.children, key)}
          </HeadingTag>
        );

      case "list":
        const ListTag = child.listType === "number" ? "ol" : "ul";
        const listClass = child.listType === "number" ? "!list-decimal" : "!list-disc";
        return (
          <ListTag key={key} className={`${listClass} !pl-6 mb-4 space-y-1`}>
            {child.children.map((item, i) => (
              <li key={`${key}-li-${i}`} className="!p-0 before:!content-none">
                {renderChildren(item.children, `${key}-li-${i}`)}
              </li>
            ))}
          </ListTag>
        );

      case "listitem":
        return <li key={key}>{renderChildren(child.children, key)}</li>;

      case "image":
      case "upload": {
        // Support both Lexical image nodes and Payload upload nodes
        const imgSrc = child.src || child.url || child.value?.url;
        const imgAlt = child.altText || child.alt || child.value?.alt || "";
        const imgWidth = child.width || child.value?.width || 800;
        const imgHeight = child.height || child.value?.height || 450;
        const imgCaption = child.caption;

        if (!imgSrc) return null;

        return (
          <figure key={key} className="my-6">
            <Image
              src={imgSrc}
              alt={imgAlt}
              width={imgWidth}
              height={imgHeight}
              className="rounded-xl"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
            />
            {imgCaption && (
              <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                {imgCaption}
              </figcaption>
            )}
          </figure>
        );
      }

      default:
        return null;
    }
  });
}

/**
 * Get prose classes based on variant and options
 */
function getProseClasses(
  variant: ProseVariant,
  options: { leadParagraph?: boolean }
): string {
  const baseClasses = "prose max-w-none";

  // Variant-specific defaults
  const variantDefaults: Record<ProseVariant, { leadParagraph: boolean }> = {
    default: { leadParagraph: false },
    article: { leadParagraph: true },
    product: { leadParagraph: false },
    minimal: { leadParagraph: false },
  };

  const defaults = variantDefaults[variant];
  const showLeadParagraph = options.leadParagraph ?? defaults.leadParagraph;

  const classes = [baseClasses];

  if (showLeadParagraph) classes.push("prose-lead");

  // Variant-specific classes
  if (variant === "article") classes.push("prose-article");
  if (variant === "product") classes.push("prose-product");

  return classes.join(" ");
}

export function LexicalRenderer({
  content,
  className = "",
  variant = "default",
  leadParagraph,
}: LexicalRendererProps) {
  if (!content) {
    return null;
  }

  const proseClasses = getProseClasses(variant, { leadParagraph });

  // Handle HTML string from CKEditor
  // Sanitize to prevent XSS attacks
  if (typeof content === "string") {
    const sanitizedContent = DOMPurify.sanitize(content, {
      ADD_TAGS: ["iframe"], // Allow iframes for embedded content
      ADD_ATTR: ["target", "rel", "allowfullscreen", "frameborder", "loading", "decoding", "fetchpriority", "sizes"], // Allow common + image optimization attrs
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });

    // Add lazy loading and decoding attributes to img tags in HTML content
    const optimizedContent = sanitizedContent.replace(
      /<img\b(?![^>]*\bloading=)/gi,
      '<img loading="lazy" decoding="async"'
    );
    return (
      <div
        className={`${proseClasses} ${className}`}
        dangerouslySetInnerHTML={{ __html: optimizedContent }}
      />
    );
  }

  // Handle Lexical JSON format (legacy)
  if (!content.root || !content.root.children) {
    return null;
  }

  return (
    <div className={`${proseClasses} ${className}`}>
      {renderChildren(content.root.children, "lexical")}
    </div>
  );
}
