"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { HashScroll } from "@/components/hash-scroll";
import { PageFrame } from "@/components/page-frame";
import { RelatedRail } from "@/components/related-rail";
import { useSkin } from "@/components/providers/skin-provider";

export type ArtView = {
  slug: string;
  title: string;
  medium: string;
  section: string;
  year?: number;
  description?: string;
  content: string;
  todo?: string;
};

function swarmPoint(i: number, mode: "swarm" | "board") {
  if (mode === "board") {
    const col = i % 6;
    const row = Math.floor(i / 6);
    return { x: 6 + col * 16, y: 10 + row * 22 };
  }
  const golden = Math.PI * (3 - Math.sqrt(5));
  const r = 8 + (i % 12) * 3.2;
  const a = i * golden;
  return { x: 50 + Math.cos(a) * r, y: 48 + Math.sin(a) * r * 0.72 };
}

export function ArtStage({ works }: { works: ArtView[] }) {
  const { definition } = useSkin();
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<"swarm" | "board">("swarm");
  const tiles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        i,
        label: String(i + 1).padStart(2, "0"),
        work: works[0],
      })),
    [works],
  );

  return (
    <PageFrame
      kicker="Art"
      title="Workshop swarm."
      lede="Visualization and deck batches — a spatial board, not a children’s-book gallery. Stills are not public yet; the 24 slots are the batch size."
      actions={
        <button
          type="button"
          onClick={() => setMode((m) => (m === "swarm" ? "board" : "swarm"))}
          className="border border-line px-4 py-2 text-sm"
        >
          {mode === "swarm" ? "Snap to board" : "Release swarm"}
        </button>
      }
    >
      <HashScroll />
      <div
        className="relative min-h-[28rem] overflow-hidden border border-line bg-panel/20"
        style={{ borderRadius: "var(--radius-shell, 1.25rem)" }}
      >
        {tiles.map((tile) => {
          const p = swarmPoint(tile.i, mode);
          return (
            <motion.div
              key={tile.i}
              layout
              className="absolute flex size-16 items-center justify-center border border-line bg-background/80 font-mono text-xs text-accent shadow-glow sm:size-20"
              style={{ borderRadius: "var(--radius-shell, 0.4rem)", left: `${p.x}%`, top: `${p.y}%` }}
              initial={reduce ? false : { scale: 0, rotate: 25 }}
              animate={{ scale: 1, rotate: mode === "swarm" ? (tile.i % 7) - 3 : 0 }}
              transition={{ ...definition.motion, delay: reduce ? 0 : tile.i * 0.02 }}
            >
              {tile.label}
            </motion.div>
          );
        })}
      </div>
      {works.map((work) => (
        <article
          key={work.slug}
          id={work.slug}
          className="scroll-mt-28 mt-8 border border-line bg-panel/40 p-5"
          style={{ borderRadius: "var(--radius-shell, 1rem)" }}
        >
          <p className="font-mono text-[10px] tracking-[0.16em] text-accent-2 uppercase">
            {work.medium} · {work.section}
            {work.year ? ` · ${work.year}` : ""}
          </p>
          <h2 className="mt-2 text-2xl">{work.title}</h2>
          {work.description ? <p className="mt-2 text-muted">{work.description}</p> : null}
          <p className="mt-3 text-sm leading-6 text-muted">{work.content}</p>
          {work.todo ? <p className="mt-3 font-mono text-[11px] text-accent">{work.todo}</p> : null}
          <RelatedRail nodeId={`art:${work.slug}`} compact />
        </article>
      ))}
    </PageFrame>
  );
}
