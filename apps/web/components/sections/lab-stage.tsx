"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { HashScroll } from "@/components/hash-scroll";
import { MarkdownBody } from "@/components/markdown-body";
import { PageFrame } from "@/components/page-frame";
import { RelatedRail } from "@/components/related-rail";
import { useSkin } from "@/components/providers/skin-provider";

export type LabView = {
  slug: string;
  title: string;
  status: string;
  kind: string;
  summary: string;
  content: string;
  featured?: boolean;
  todo?: string;
};

const KIND_GLYPH: Record<string, string> = {
  homelab: "▣",
  robotics: "⬡",
  simulation: "⌬",
  workshop: "◈",
};

export function LabStage({ labs }: { labs: LabView[] }) {
  const { definition } = useSkin();
  const reduce = useReducedMotion();

  return (
    <PageFrame
      kicker="Lab"
      title="Machines in the notebook."
      lede="Homelab, BEAST, Broadside — telemetry language, not a games page. Private hosts stay off this site."
      actions={
        <Link href="/lab/context-engine" className="border border-line bg-accent px-4 py-2 text-sm text-background">
          Context engine sketch
        </Link>
      }
    >
      <HashScroll />
      <div className="grid gap-4">
        {labs.map((lab, i) => (
          <motion.article
            key={lab.slug}
            id={lab.slug}
            className="scroll-mt-28 overflow-hidden border border-line bg-panel/30"
            style={{ borderRadius: "var(--radius-shell, 0.85rem)" }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...definition.motion, delay: i * definition.stagger }}
          >
            <div className="flex items-stretch">
              <div className="flex w-14 flex-col items-center justify-center border-r border-line bg-background/50 font-mono text-accent">
                <motion.span
                  animate={reduce ? undefined : { opacity: [0.35, 1, 0.35] }}
                  transition={{ repeat: Infinity, duration: 1.6 + i * 0.3 }}
                  className="text-xl"
                >
                  {KIND_GLYPH[lab.kind] ?? "▣"}
                </motion.span>
                <span className="mt-2 text-[9px] tracking-[0.14em] uppercase">{lab.status}</span>
              </div>
              <div className="flex-1 p-4">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-accent shadow-glow" />
                  <p className="font-mono text-[10px] tracking-[0.16em] text-accent-2 uppercase">
                    {lab.kind} · telemetry
                  </p>
                </div>
                <h2 className="mt-1 text-2xl">{lab.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{lab.summary}</p>
                <MarkdownBody source={lab.content} className="text-sm" />
                {lab.todo ? <p className="mt-2 font-mono text-[11px] text-accent">{lab.todo}</p> : null}
                <RelatedRail nodeId={`lab:${lab.slug}`} compact />
              </div>
            </div>
            <motion.div
              className="h-px bg-accent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              style={{ transformOrigin: "0% 50%" }}
              transition={{ duration: reduce ? 0 : 1.4, delay: i * 0.15 }}
            />
          </motion.article>
        ))}
      </div>
    </PageFrame>
  );
}
