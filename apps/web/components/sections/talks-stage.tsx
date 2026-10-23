"use client";

import { motion, useReducedMotion } from "motion/react";
import { HashScroll } from "@/components/hash-scroll";
import { MarkdownBody } from "@/components/markdown-body";
import { PageFrame } from "@/components/page-frame";
import { RelatedRail } from "@/components/related-rail";
import { useSkin } from "@/components/providers/skin-provider";
import { formatDate } from "@/lib/format";

export type TalkView = {
  slug: string;
  title: string;
  event: string;
  date: string;
  kind: string;
  location?: string;
  description?: string;
  content: string;
  todo?: string;
  slidesUrl?: string;
  videoUrl?: string;
};

export function TalksStage({ talks }: { talks: TalkView[] }) {
  const { definition } = useSkin();
  const reduce = useReducedMotion();

  return (
    <PageFrame
      kicker="Talks"
      title="Stage lights, empty deck."
      lede="Public talks were not seeded. The slot exists so the graph does not pretend otherwise."
    >
      <HashScroll />
      <div className="relative overflow-hidden border border-line bg-background p-6 sm:p-10" style={{ borderRadius: "var(--radius-shell, 1.25rem)" }}>
        <motion.div
          className="pointer-events-none absolute -top-24 left-1/4 size-64 rounded-full bg-accent/25 blur-3xl"
          animate={reduce ? undefined : { opacity: [0.2, 0.55, 0.2], x: [0, 40, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute -top-16 right-1/5 size-56 rounded-full bg-accent-2/20 blur-3xl"
          animate={reduce ? undefined : { opacity: [0.15, 0.45, 0.15], x: [0, -30, 0] }}
          transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
        />
        <div className="relative grid gap-6">
          {talks.map((talk, i) => (
            <motion.article
              key={talk.slug}
              id={talk.slug}
              className="scroll-mt-28 border border-line bg-panel/50 p-5 shadow-glow"
              style={{ borderRadius: "var(--radius-shell, 0.75rem)", transformOrigin: "top center" }}
              initial={reduce ? false : { rotateX: -70, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ ...definition.motion, delay: i * 0.12 }}
            >
              <p className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
                {talk.kind} · {talk.event} · {formatDate(talk.date)}
              </p>
              <h2 className="font-display mt-2 text-3xl">{talk.title}</h2>
              {talk.location ? <p className="mt-1 text-sm text-muted">{talk.location}</p> : null}
              {talk.description ? <p className="mt-3 text-muted">{talk.description}</p> : null}
              <MarkdownBody source={talk.content} />
              {talk.todo ? <p className="mt-3 font-mono text-[11px] text-accent">{talk.todo}</p> : null}
              <RelatedRail nodeId={`talk:${talk.slug}`} compact />
            </motion.article>
          ))}
        </div>
      </div>
    </PageFrame>
  );
}
