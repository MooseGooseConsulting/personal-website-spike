"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ForceGraph } from "@/components/graph/force-graph";
import { HashScroll } from "@/components/hash-scroll";
import { PageFrame } from "@/components/page-frame";
import { RelatedRail } from "@/components/related-rail";
import { useSkin } from "@/components/providers/skin-provider";
import { notebookGraph } from "@/lib/graph-data";

export type WorkItem = {
  id: string;
  kind: "project" | "topic" | "output";
  slug: string;
  title: string;
  summary: string;
  href: string;
  meta: string;
  todo?: string;
};

const KINDS: WorkItem["kind"][] = ["project", "topic", "output"];

export function WorkExplorer({ items }: { items: WorkItem[] }) {
  const { definition, skin } = useSkin();
  const reduce = useReducedMotion();
  const [kinds, setKinds] = useState<Set<WorkItem["kind"]>>(new Set(KINDS));
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "graph">("list");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!kinds.has(item.kind)) return false;
      if (!q) return true;
      return `${item.title} ${item.summary} ${item.meta}`.toLowerCase().includes(q);
    });
  }, [items, kinds, query]);

  const graphNodes = useMemo(
    () =>
      visible.map((item) => ({
        id: item.id,
        label: item.title,
        type: item.kind,
        href: item.href,
        weight: item.kind === "topic" ? 1.4 : 1.2,
      })),
    [visible],
  );
  const graphIds = useMemo(() => new Set(visible.map((item) => item.id)), [visible]);
  const graphEdges = useMemo(
    () => notebookGraph.edges.filter((edge) => graphIds.has(edge.source) && graphIds.has(edge.target)),
    [graphIds],
  );

  function toggle(kind: WorkItem["kind"]) {
    setKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) {
        if (next.size === 1) return prev;
        next.delete(kind);
      } else {
        next.add(kind);
      }
      return next;
    });
  }

  const explode = (kind: WorkItem["kind"]) => {
    if (reduce) return {};
    if (skin === "print-disrupt") return { scale: 0.2, rotate: -12, opacity: 0 };
    if (skin === "spatial-atlas") return { scale: 1.4, opacity: 0, filter: "blur(12px)" };
    if (skin === "foundry-glass") return { y: 40, opacity: 0, filter: "blur(16px)" };
    return { x: kind === "output" ? 80 : -80, y: -30, opacity: 0, scale: 0.6 };
  };

  return (
    <PageFrame
      kicker="Work"
      title="Projects, topics, outputs."
      lede="Filter the set. Switch list ↔ graph — rows keep their layoutId and become nodes."
      wide
      actions={
        <>
          {KINDS.map((kind) => {
            const on = kinds.has(kind);
            return (
              <motion.button
                key={kind}
                type="button"
                layout
                onClick={() => toggle(kind)}
                className={`border px-4 py-2 font-mono text-[11px] tracking-[0.16em] uppercase ${
                  on ? "border-accent bg-accent/15 text-foreground" : "border-line text-muted"
                }`}
                animate={on ? { scale: 1 } : { scale: 0.92 }}
                style={{ borderRadius: "var(--radius-shell, 0.5rem)" }}
              >
                {kind}s
              </motion.button>
            );
          })}
          <label className="sr-only" htmlFor="work-search">
            Search
          </label>
          <input
            id="work-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="min-w-[12rem] flex-1 border border-line bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => setView((v) => (v === "list" ? "graph" : "list"))}
            className="border border-line bg-panel px-4 py-2 text-sm"
          >
            {view === "list" ? "Graph view" : "List view"}
          </button>
        </>
      }
    >
      <HashScroll />
      <LayoutGroup id="work-morph">
        <AnimatePresence mode="popLayout">
          {view === "list" ? (
            <motion.ul layout className="flex flex-col gap-3" key="list">
              <AnimatePresence>
                {visible.map((item) => (
                  <motion.li
                    key={item.id}
                    layoutId={`work-${item.id}`}
                    id={item.slug}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={explode(item.kind)}
                    transition={definition.motion}
                    className="scroll-mt-28 border border-line bg-panel/40 p-4"
                    style={{ borderRadius: "var(--radius-shell, 0.75rem)" }}
                  >
                    <p className="font-mono text-[10px] tracking-[0.16em] text-accent-2 uppercase">
                      {item.kind} · {item.meta}
                    </p>
                    {item.href.startsWith("http") ? (
                      <a href={item.href} className="mt-1 block text-xl" target="_blank" rel="noreferrer">
                        {item.title}
                      </a>
                    ) : (
                      <Link href={item.href} className="mt-1 block text-xl">
                        {item.title}
                      </Link>
                    )}
                    <p className="mt-2 text-sm leading-6 text-muted">{item.summary}</p>
                    {item.todo ? (
                      <p className="mt-2 font-mono text-[11px] text-accent">{item.todo}</p>
                    ) : null}
                    <RelatedRail nodeId={item.id} compact />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <motion.div
              key="graph"
              layout
              className="relative min-h-[32rem] border border-line bg-panel/20"
              style={{ borderRadius: "var(--radius-shell, 1rem)" }}
            >
              <ForceGraph
                nodes={graphNodes}
                edges={graphEdges}
                layoutIdFor={(id) => `work-${id}`}
                variant="explorer"
                className="absolute inset-0"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </PageFrame>
  );
}
