"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { Math } from "@/components/lessons/math";
import { QuickCheck } from "@/components/lessons/quick-check";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ContentBlock } from "@/types/curriculum";

function MarkdownText({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => (
          <p className="leading-relaxed [&>a]:text-primary">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em>{children}</em>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading": {
      const Tag = block.level === 2 ? "h2" : block.level === 3 ? "h3" : "h4";
      return (
        <Tag
          className={
            block.level === 2
              ? "mt-2 text-lg font-semibold"
              : "text-base font-semibold"
          }
        >
          {block.text}
        </Tag>
      );
    }
    case "paragraph":
      return (
        <div className="text-[15px] text-foreground/90">
          <MarkdownText text={block.text} />
        </div>
      );
    case "list": {
      const items = block.items.map((item, i) => (
        <li key={i} className="leading-relaxed">
          <MarkdownText text={item} />
        </li>
      ));
      return block.ordered ? (
        <ol className="ml-5 list-decimal space-y-1.5 text-[15px] text-foreground/90">
          {items}
        </ol>
      ) : (
        <ul className="ml-5 list-disc space-y-1.5 text-[15px] text-foreground/90">
          {items}
        </ul>
      );
    }
    case "math":
      return <Math value={block.value} display={block.display ?? true} />;
    case "image":
      return (
        <figure className="my-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt}
            className="max-h-80 rounded-lg border border-border"
          />
          {block.caption ? (
            <figcaption className="mt-1.5 text-center text-xs text-muted-foreground">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    case "worked_example":
      return (
        <div className="rounded-xl border border-border bg-muted/50 p-4">
          <p className="text-sm font-semibold text-primary">{block.title}</p>
          <div className="mt-3 flex flex-col gap-3">
            {block.content.map((child) => (
              <BlockRenderer key={child.id} block={child} />
            ))}
          </div>
        </div>
      );
    case "key_idea":
      return (
        <aside className="rounded-xl border-l-4 border-primary bg-accent/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">
            Key idea
          </p>
          <p className="mt-1.5 text-[15px] leading-relaxed">{block.text}</p>
        </aside>
      );
    case "callout":
      return (
        <aside className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {block.title ?? (block.variant === "tip" ? "Tip" : "Note")}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
            {block.text}
          </p>
        </aside>
      );
    case "quick_check":
      return (
        <QuickCheck
          questionId={block.questionId}
          question={block.question}
          options={block.options}
          correctOptionId={block.correctOptionId}
          explanation={block.explanation}
        />
      );
    case "table":
      return (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                {block.headers.map((header, i) => (
                  <TableHead key={i}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {block.rows.map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {block.caption ? (
            <p className="mt-1.5 text-xs text-muted-foreground">{block.caption}</p>
          ) : null}
        </div>
      );
    case "diagram":
      return (
        <figure className="rounded-xl border-2 border-dashed border-border bg-muted/40 p-4 text-center">
          <div
            className="mx-auto mb-2 flex max-w-xs flex-col items-center gap-1 font-mono text-xs text-muted-foreground"
            aria-label={block.description}
          >
            {block.description}
          </div>
          <figcaption className="text-xs font-medium">{block.label}</figcaption>
        </figure>
      );
    default:
      return null;
  }
}

export function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  return <BlockRenderer block={block} />;
}
