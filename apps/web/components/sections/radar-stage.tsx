"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { PageFrame } from "@/components/page-frame";
import { useSkin } from "@/components/providers/skin-provider";

export type RadarItemView = {
  title: string;
  url: string;
  category: string;
  kind: string;
  note?: string;
  tags: string[];
  added: string;
  featured?: boolean;
};

export function RadarStage({ items }: { items: RadarItemView[] }) {
  const { definition } = useSkin();
  const reduce = useReducedMotion();
  const groups = useMemo(() => {
    const map = new Map<string, RadarItemView[]>();
    for (const item of items) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return [...map.entries()];
  }, [items]);

  return (
    <PageFrame
      kicker="Radar"
      title="Incoming watchlist."
      lede={
        <>
          Seeded from <code className="font-mono text-accent">content/links/inbox.yaml</code>. “Add this
          to radar” is an agent instruction — there is no CMS form here.
        </>
      }
    >
      <div className="grid gap-10">
        {groups.map(([category, rows], gi) => (
          <section key={category}>
            <motion.h2
              layout
              className="font-display sticky top-16 z-10 border-b border-line bg-background/80 py-2 text-3xl backdrop-blur"
              initial={reduce ? false : { x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ ...definition.motion, delay: gi * 0.08 }}
            >
              {category}
            </motion.h2>
            <ul className="mt-4 grid gap-3">
              {rows.map((item, i) => (
                <motion.li
                  key={`${item.url}-${item.title}`}
                  initial={
                    reduce
                      ? { opacity: 1 }
                      : { y: -80 - i * 12, opacity: 0, rotate: -4 }
                  }
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{
                    ...definition.motion,
                    delay: reduce ? 0 : gi * 0.12 + i * 0.07,
                  }}
                  className="border border-line bg-panel/40 p-4"
                  style={{ borderRadius: "var(--radius-shell, 0.75rem)" }}
                >
                  <p className="font-mono text-[10px] tracking-[0.16em] text-accent-2 uppercase">
                    {item.kind}
                    {item.featured ? " · featured" : ""}
                  </p>
                  <a href={item.url} target="_blank" rel="noreferrer" className="mt-1 block text-lg">
                    {item.title}
                  </a>
                  {item.note ? <p className="mt-2 text-sm leading-6 text-muted">{item.note}</p> : null}
                  <p className="mt-2 font-mono text-[10px] text-muted">{item.tags.join(" · ")}</p>
                </motion.li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageFrame>
  );
}
