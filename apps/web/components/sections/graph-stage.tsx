"use client";

import { useMemo, useState } from "react";
import { ForceGraph } from "@/components/graph/force-graph";
import { RelatedRail } from "@/components/related-rail";
import { notebookGraph, siteHref } from "@/lib/graph-data";
import { useSkin } from "@/components/providers/skin-provider";

export function GraphStage() {
  const { skin } = useSkin();
  const [focus, setFocus] = useState<string | null>(null);
  const nodes = useMemo(
    () =>
      notebookGraph.nodes.map((node) => ({
        id: node.id,
        label: node.label,
        type: node.type,
        weight: node.weight,
      })),
    [],
  );
  const focused = notebookGraph.nodes.find((n) => n.id === focus);

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-5 py-4 sm:px-8">
        <div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-accent-2 uppercase">Graph</p>
          <h1 className="font-display mt-1 text-3xl sm:text-4xl">Full map</h1>
        </div>
        <p className="max-w-md text-sm text-muted">
          Custom force layout — not Cytoscape. Scroll to zoom, drag to pan, click a node to
          focus-lock. {notebookGraph.nodes.length} nodes / {notebookGraph.edges.length} edges · {skin}
        </p>
      </div>
      <div className="relative min-h-[70vh] flex-1">
        <ForceGraph
          nodes={nodes}
          edges={notebookGraph.edges}
          focusedId={focus}
          onFocus={setFocus}
          variant="full"
          className="absolute inset-0"
        />
        {focused ? (
          <aside
            className="absolute right-4 bottom-24 z-20 w-[min(22rem,calc(100vw-2rem))] border border-line bg-panel/90 p-4 backdrop-blur"
            style={{ borderRadius: "var(--radius-shell, 0.85rem)" }}
          >
            <p className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">{focused.type}</p>
            <h2 className="mt-1 text-lg">{focused.label}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{focused.summary}</p>
            <a href={siteHref(focused)} className="mt-3 inline-block text-sm text-accent">
              Open node →
            </a>
            <RelatedRail nodeId={focused.id} compact />
          </aside>
        ) : null}
      </div>
    </main>
  );
}
