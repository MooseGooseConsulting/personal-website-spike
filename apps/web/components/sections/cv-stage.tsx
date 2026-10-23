"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { HashScroll } from "@/components/hash-scroll";
import { MarkdownBody } from "@/components/markdown-body";
import { PageFrame } from "@/components/page-frame";
import { RelatedRail } from "@/components/related-rail";
import { useSkin } from "@/components/providers/skin-provider";
import { formatRange } from "@/lib/format";

export type CvView = {
  slug: string;
  title: string;
  org: string;
  location?: string;
  category: string;
  start: string;
  end?: string;
  current?: boolean;
  summary?: string;
  highlights: string[];
  content: string;
  todo?: string;
  order?: number;
};

export function CvStage({ entries }: { entries: CvView[] }) {
  const { definition } = useSkin();
  const [open, setOpen] = useState<string | null>(entries.find((e) => e.current)?.slug ?? entries[0]?.slug ?? null);
  const stacked = [...entries].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  return (
    <PageFrame
      kicker="CV"
      title="A timeline that physically stacks."
      lede="Public bio: MooseGoose, Oliver Wyman, LifeCare, Pacific Life, UCR, National Merit. Click a card; the rest remain a stack."
    >
      <HashScroll />
      <div className="relative mx-auto w-full max-w-2xl" style={{ perspective: 1200 }}>
        <AnimatePresence>
          {stacked.map((entry, i) => {
            const selected = open === entry.slug;
            const offset = selected ? 0 : i * 14;
            return (
              <motion.article
                key={entry.slug}
                id={entry.slug}
                layout
                onClick={() => setOpen(entry.slug)}
                className="relative mb-3 cursor-pointer scroll-mt-28 border border-line bg-panel/80 p-5 shadow-glow"
                style={{
                  borderRadius: "var(--radius-shell, 0.85rem)",
                  zIndex: selected ? 20 : stacked.length - i,
                }}
                animate={{
                  y: selected ? 0 : offset * 0.2,
                  scale: selected ? 1 : 0.985,
                  rotateZ: selected ? 0 : (i % 2 === 0 ? -0.4 : 0.4),
                }}
                transition={definition.motion}
              >
                <p className="font-mono text-[10px] tracking-[0.16em] text-accent-2 uppercase">
                  {entry.category} · {formatRange(entry.start, entry.end, entry.current)}
                </p>
                <h2 className="mt-1 text-2xl">{entry.title}</h2>
                <p className="text-muted">
                  {entry.org}
                  {entry.location ? ` · ${entry.location}` : ""}
                </p>
                {selected ? (
                  <div className="mt-3">
                    {entry.summary ? <p className="text-sm leading-6 text-muted">{entry.summary}</p> : null}
                    {entry.highlights.length ? (
                      <ul className="mt-3 list-disc pl-5 text-sm leading-6 text-muted">
                        {entry.highlights.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    ) : null}
                    <MarkdownBody source={entry.content} className="text-sm" />
                    {entry.todo ? <p className="mt-2 font-mono text-[11px] text-accent">{entry.todo}</p> : null}
                    <RelatedRail nodeId={`cv:${entry.slug}`} compact />
                  </div>
                ) : null}
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </PageFrame>
  );
}
