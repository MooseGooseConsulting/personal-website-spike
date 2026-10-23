"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ForceGraph, type OverlayNode } from "@/components/graph/force-graph";
import { RelatedRail } from "@/components/related-rail";
import { useSkin } from "@/components/providers/skin-provider";
import { notebookGraph, siteHref } from "@/lib/graph-data";

const FEATURED_IDS = [
  "project:coldsearch",
  "project:northstar-guardian",
  "post:the-model-will-do-exactly-what-you-told-it",
];

export type HomePayload = {
  collectionCount: number;
  currently: { title: string; org: string; href: string };
  digest: { title: string; slug: string; summary: string };
  featured: { id: string; title: string; summary: string; href: string; kicker: string }[];
};

export function HomeStage({ payload }: { payload: HomePayload }) {
  const { definition, skin } = useSkin();
  const reduce = useReducedMotion();
  const [peeled, setPeeled] = useState(reduce === true);

  useEffect(() => {
    const id = window.setTimeout(() => setPeeled(true), reduce ? 0 : 900);
    return () => window.clearTimeout(id);
  }, [reduce]);

  const overlay: OverlayNode[] = useMemo(
    () =>
      notebookGraph.nodes.map((node) => ({
        id: node.id,
        label: node.label,
        type: node.type,
        href: siteHref(node),
        weight: node.weight,
      })),
    [],
  );

  const hidden = useMemo(() => (peeled ? new Set(FEATURED_IDS) : new Set<string>()), [peeled]);
  const featuredCards = payload.featured.filter((item) => FEATURED_IDS.includes(item.id));

  return (
    <LayoutGroup id="home-creature">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-14 px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center">
          <div>
            <motion.p layout className="font-mono text-[11px] tracking-[0.28em] text-accent-2 uppercase">
              Patrick MacLyman · MooseGoose
            </motion.p>
            <motion.h1
              layoutId="skin-headline"
              className="font-display mt-4 max-w-[14ch] text-5xl sm:text-7xl"
              transition={definition.motion}
            >
              A typed graph that agents keep humming.
            </motion.h1>
            <motion.p
              layout
              className="mt-6 max-w-xl text-lg leading-8 text-muted"
              transition={definition.motion}
            >
              Git is the CMS. Collections are the graph. This notebook is how I put the work
              together — not a second marketing site for{" "}
              <a href="https://moosegoose.xyz/" className="text-accent">
                moosegoose.xyz
              </a>
              . {payload.collectionCount} seeded docs, four live skins.
            </motion.p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/graph"
                className="border border-line bg-accent px-5 py-3 text-sm font-medium text-background"
              >
                Explore the full map
              </Link>
              <Link href="/work" className="border border-line px-5 py-3 text-sm">
                Selected work
              </Link>
            </div>
          </div>

          <motion.div
            layout
            className="relative min-h-[22rem] overflow-hidden border border-line bg-panel/30 shadow-glow sm:min-h-[28rem]"
            style={{ borderRadius: "var(--radius-shell, 1.5rem)" }}
            transition={definition.motion}
          >
            <ForceGraph
              nodes={overlay}
              edges={notebookGraph.edges}
              hiddenIds={hidden}
              layoutIdFor={(id) => (FEATURED_IDS.includes(id) ? `peel-${id}` : undefined)}
              variant="hero"
              className="absolute inset-0"
            />
            <p className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
              {skin} · living graph
            </p>
          </motion.div>
        </div>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-accent-2 uppercase">Currently</p>
            <h2 className="font-display mt-2 text-3xl">{payload.currently.title}</h2>
            <p className="mt-2 text-muted">{payload.currently.org}</p>
            <Link href={payload.currently.href} className="mt-4 inline-block text-accent">
              CV timeline →
            </Link>
            <div className="mt-8 border border-line bg-panel/40 p-4" style={{ borderRadius: "var(--radius-shell, 1rem)" }}>
              <p className="font-mono text-[10px] tracking-[0.18em] text-accent uppercase">Latest digest</p>
              <Link href={`/digest#${payload.digest.slug}`} className="mt-2 block text-lg">
                {payload.digest.title}
              </Link>
              <p className="mt-2 text-sm leading-6 text-muted">{payload.digest.summary}</p>
            </div>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-accent-2 uppercase">
              Selected · peeled from the creature
            </p>
            <div className="mt-4 grid gap-4">
              <AnimatePresence>
                {peeled
                  ? featuredCards.map((card, i) => (
                      <motion.article
                        key={card.id}
                        layoutId={`peel-${card.id}`}
                        className="border border-line bg-panel/50 p-4 shadow-glow"
                        style={{ borderRadius: "var(--radius-shell, 1rem)" }}
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ ...definition.motion, delay: i * definition.stagger }}
                      >
                        <p className="font-mono text-[10px] tracking-[0.16em] text-accent-2 uppercase">
                          {card.kicker}
                        </p>
                        <Link href={card.href} className="mt-1 block text-xl">
                          {card.title}
                        </Link>
                        <p className="mt-2 text-sm leading-6 text-muted">{card.summary}</p>
                        <RelatedRail nodeId={card.id} compact />
                      </motion.article>
                    ))
                  : null}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>
    </LayoutGroup>
  );
}
