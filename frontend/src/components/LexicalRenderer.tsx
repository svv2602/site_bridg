/**
 * Lexical Renderer Component
 *
 * Renders Lexical JSON content as HTML.
 * Supports: paragraph, heading, list, listItem, link, text formatting.
 */

"use client";

import Link from "next/link";

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

type LexicalNode =
  | LexicalTextNode
  | LexicalLinkNode
  | LexicalListItemNode
  | LexicalListNode
  | LexicalHeadingNode
  | LexicalParagraphNode;

interface LexicalRoot {
  root: {
    children: LexicalNode[];
    type: "root";
  };
}

interface LexicalRendererProps {
  content: LexicalRoot | null | undefined;
  className?: string;
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
              className="text-primary underline hover:no-underline"
            >
              {renderChildren(child.children, key)}
            </a>
          );
        }
        return (
          <Link key={key} href={child.url} className="text-primary underline hover:no-underline">
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
        const listClass = child.listType === "number" ? "list-decimal" : "list-disc";
        return (
          <ListTag key={key} className={`${listClass} pl-6 mb-4 space-y-1`}>
            {child.children.map((item, i) => (
              <li key={`${key}-li-${i}`}>
                {renderChildren(item.children, `${key}-li-${i}`)}
              </li>
            ))}
          </ListTag>
        );

      case "listitem":
        return <li key={key}>{renderChildren(child.children, key)}</li>;

      default:
        return null;
    }
  });
}

export function LexicalRenderer({ content, className = "" }: LexicalRendererProps) {
  if (!content || !content.root || !content.root.children) {
    return null;
  }

  return (
    <div className={`prose prose-zinc dark:prose-invert max-w-none ${className}`}>
      {renderChildren(content.root.children, "lexical")}
    </div>
  );
}
