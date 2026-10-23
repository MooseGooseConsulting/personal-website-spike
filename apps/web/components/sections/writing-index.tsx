"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { HashScroll } from "@/components/hash-scroll";
import { PageFrame } from "@/components/page-frame";
import { RelatedRail } from "@/components/related-rail";
import { useSkin } from "@/components/providers/skin-provider";
import { formatDate } from "@/lib/format";

export type WritingIndexItem = {
  slug: string;
  title: string;
  description: string;
  source: "on-site" | "external";
  kind: string;
  date?: string;
  href: string;
  tags: string[];
  featured?: boolean;
};

export function WritingIndex({ items }: { items: WritingIndexItem[] }) {
  const { definition } = useSkin();

  return (
    <PageFrame
      kicker="Writing"
      title="On-site essays and an external index."
      lede="Shared-element open into the article. External rows leave the notebook."
    >
      <HashScroll />
      <ul className="flex flex-col gap-4">
        {items.map((item, i) => {
          const inner = (
            <motion.article
              layoutId={item.source === "on-site" ? `writing-open-${item.slug}` : undefined}
              id={item.slug}
              className="scroll-mt-28 border border-line bg-panel/40 p-5"
              style={{ borderRadius: "var(--radius-shell, 1rem)" }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...definition.motion, delay: i * definition.stagger }}
            >
              <p className="font-mono text-[10px] tracking-[0.16em] text-accent-2 uppercase">
                {item.source} · {item.kind}
                {item.date ? ` · ${formatDate(item.date, { month: "short", day: "numeric", year: "numeric" })}` : ""}
              </p>
              <h2 className="font-display mt-2 text-3xl">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              <p className="mt-2 font-mono text-[10px] text-muted">{item.tags.join(" · ")}</p>
              <RelatedRail nodeId={`writing:${item.slug}`} compact />
            </motion.article>
          );
          return (
            <li key={item.slug}>
              {item.source === "on-site" ? (
                <Link href={item.href} className="block">
                  {inner}
                </Link>
              ) : (
                <a href={item.href} target="_blank" rel="noreferrer" className="block">
                  {inner}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </PageFrame>
  );
}
