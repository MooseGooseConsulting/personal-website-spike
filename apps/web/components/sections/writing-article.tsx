"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { MarkdownBody } from "@/components/markdown-body";
import { RelatedRail } from "@/components/related-rail";
import { useSkin } from "@/components/providers/skin-provider";
import { formatDate } from "@/lib/format";

export function WritingArticle({
  slug,
  title,
  subtitle,
  date,
  content,
  tags,
}: {
  slug: string;
  title: string;
  subtitle?: string;
  date?: string;
  content: string;
  tags: string[];
}) {
  const { definition, skin } = useSkin();
  const print = skin === "print-disrupt";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-12 sm:px-8 sm:py-16">
      <Link href="/writing" className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
        ← Writing
      </Link>
      <motion.article
        layoutId={`writing-open-${slug}`}
        className="mt-6 border border-line bg-panel/40 p-6 sm:p-10"
        style={{ borderRadius: "var(--radius-shell, 1rem)" }}
        initial={print ? { rotateY: -70, opacity: 0 } : { opacity: 0, y: 24 }}
        animate={print ? { rotateY: 0, opacity: 1 } : { opacity: 1, y: 0 }}
        transition={definition.motion}
      >
        <p className="font-mono text-[10px] tracking-[0.18em] text-accent-2 uppercase">
          On-site · {date ? formatDate(date, { month: "long", day: "numeric", year: "numeric" }) : "essay"}
        </p>
        <h1 className="font-display mt-3 text-4xl sm:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-3 text-lg text-muted">{subtitle}</p> : null}
        <p className="mt-2 font-mono text-[10px] text-muted">{tags.join(" · ")}</p>
        <MarkdownBody source={content} className="mt-8" />
        <RelatedRail nodeId={`post:${slug}`} />
      </motion.article>
    </main>
  );
}
