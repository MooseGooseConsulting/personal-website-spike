"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ForceGraph } from "@/components/graph/force-graph";
import { HashScroll } from "@/components/hash-scroll";
import { MarkdownBody } from "@/components/markdown-body";
import { PageFrame } from "@/components/page-frame";
import { RelatedRail } from "@/components/related-rail";
import { useSkin } from "@/components/providers/skin-provider";

export type LibraryTopic = {
  slug: string;
  title: string;
  summary: string;
  content: string;
};

export type LibraryConcept = {
  slug: string;
  label: string;
  definition: string;
  topic?: string;
};

export type ExplorerView = {
  id: string;
  title: string;
  summary: string;
  topic: string;
  nodes: { id: string; title: string; summary: string; url?: string; year?: number; kind: string }[];
  edges: { source: string; target: string; note?: string }[];
};

export function LibraryStage({
  topics,
  concepts,
  explorers,
}: {
  topics: LibraryTopic[];
  concepts: LibraryConcept[];
  explorers: ExplorerView[];
}) {
  const { definition } = useSkin();
  const [active, setActive] = useState(explorers[0]?.id ?? "");
  const [bloom, setBloom] = useState<string | null>(null);
  const [peeled, setPeeled] = useState<string | null>(null);
  const map = explorers.find((item) => item.id === active) ?? explorers[0];

  const graphNodes = useMemo(
    () =>
      (map?.nodes ?? []).map((node) => ({
        id: node.id,
        label: node.title,
        type: node.kind === "paper" || node.kind === "standard" ? "output" : "topic",
        weight: 1.2,
      })),
    [map],
  );
  const graphEdges = map?.edges ?? [];

  return (
    <PageFrame
      kicker="Library"
      title="Topic shelves and explorer maps."
      lede="Spike-scale, not a 32-million-paper engine. Clusters bloom; paper cards share layout with the map."
      wide
    >
      <HashScroll />
      <LayoutGroup id="library-bloom">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic, i) => {
            const open = bloom === topic.slug;
            return (
              <motion.article
                key={topic.slug}
                id={topic.slug}
                layout
                initial={{ scale: 0.86, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...definition.motion, delay: i * definition.stagger }}
                className="scroll-mt-28 border border-line bg-panel/40 p-4"
                style={{ borderRadius: "var(--radius-shell, 1rem)" }}
              >
                <button type="button" className="w-full text-left" onClick={() => setBloom(open ? null : topic.slug)}>
                  <p className="font-mono text-[10px] tracking-[0.16em] text-accent-2 uppercase">Topic</p>
                  <h2 className="mt-1 text-xl">{topic.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{topic.summary}</p>
                </button>
                <AnimatePresence>
                  {open ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <MarkdownBody source={topic.content} className="text-sm" />
                      <RelatedRail nodeId={`topic:${topic.slug}`} compact />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </section>

        <section className="mt-4">
          <p className="font-mono text-[11px] tracking-[0.22em] text-accent-2 uppercase">Concepts</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {concepts.map((concept) => (
              <motion.div
                key={concept.slug}
                id={concept.slug}
                layout
                className="scroll-mt-28 border border-line px-3 py-2"
                style={{ borderRadius: "var(--radius-shell, 0.5rem)" }}
                title={concept.definition}
              >
                <p className="text-sm">{concept.label}</p>
                <p className="max-w-xs text-[11px] leading-4 text-muted">{concept.definition}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {map ? (
          <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <p className="font-mono text-[11px] tracking-[0.22em] text-accent-2 uppercase">Explorers</p>
              <div className="mt-3 flex flex-col gap-2">
                {explorers.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActive(item.id)}
                    className={`border px-4 py-3 text-left ${
                      item.id === map.id ? "border-accent bg-accent/10" : "border-line bg-panel/30"
                    }`}
                    style={{ borderRadius: "var(--radius-shell, 0.75rem)" }}
                  >
                    <span className="block text-lg">{item.title}</span>
                    <span className="mt-1 block text-sm text-muted">{item.summary}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4">
              <div
                className="relative min-h-[22rem] border border-line bg-panel/20"
                style={{ borderRadius: "var(--radius-shell, 1rem)" }}
              >
                <ForceGraph
                  nodes={graphNodes}
                  edges={graphEdges}
                  hiddenIds={peeled ? new Set([peeled]) : undefined}
                  layoutIdFor={(id) => `lib-node-${map.id}-${id}`}
                  focusedId={peeled}
                  onFocus={(id) => setPeeled(id)}
                  variant="explorer"
                  className="absolute inset-0"
                />
              </div>
              {peeled && map.nodes.some((n) => n.id === peeled) ? (
                <motion.article
                  layoutId={`lib-node-${map.id}-${peeled}`}
                  className="border border-accent bg-background/80 p-4 shadow-glow"
                  style={{ borderRadius: "var(--radius-shell, 0.75rem)" }}
                >
                  {(() => {
                    const node = map.nodes.find((n) => n.id === peeled);
                    if (!node) return null;
                    return (
                      <>
                        <p className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
                          {node.kind}
                          {node.year ? ` · ${node.year}` : ""} · peeled
                        </p>
                        {node.url?.startsWith("/") ? (
                          <Link href={node.url} className="mt-1 block text-lg">
                            {node.title}
                          </Link>
                        ) : (
                          <a href={node.url} className="mt-1 block text-lg" target="_blank" rel="noreferrer">
                            {node.title}
                          </a>
                        )}
                        <p className="mt-2 text-sm leading-6 text-muted">{node.summary}</p>
                        <button
                          type="button"
                          className="mt-3 font-mono text-[11px] text-accent"
                          onClick={() => setPeeled(null)}
                        >
                          Return to map
                        </button>
                      </>
                    );
                  })()}
                </motion.article>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                {map.nodes.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setPeeled(node.id)}
                    className="border border-line bg-background/70 p-3 text-left"
                    style={{ borderRadius: "var(--radius-shell, 0.75rem)" }}
                  >
                    <p className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
                      {node.kind}
                      {node.year ? ` · ${node.year}` : ""}
                    </p>
                    <span className="mt-1 block text-sm">{node.title}</span>
                    <p className="mt-1 text-xs leading-5 text-muted">{node.summary}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </LayoutGroup>
    </PageFrame>
  );
}
