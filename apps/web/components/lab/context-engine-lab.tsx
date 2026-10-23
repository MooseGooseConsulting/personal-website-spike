"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ContextEngineCanvas } from "@/components/lab/context-engine-canvas";
import { PIPELINE_STAGES } from "@/lib/notebook-pipeline";

export function ContextEngineLab() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % PIPELINE_STAGES.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  const stage = PIPELINE_STAGES[active];

  return (
    <div className="flex min-h-full flex-col text-foreground">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-6 py-5 sm:px-10">
        <div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
            Lab / motion
          </p>
          <h1 className="font-display mt-1 text-2xl sm:text-3xl">
            Notebook context engine
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link href="/lab" className="text-sm text-accent">
            ← Lab
          </Link>
          <p className="max-w-md text-right text-sm leading-6 text-muted">
            Scoped to this spike: git-backed collections, MCP writes, and
            build-time retrieval — not a generic product demo.
          </p>
        </div>
      </header>

      <div className="grid flex-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:p-8">
        <div className="relative min-h-[28rem] overflow-hidden border border-line bg-background shadow-glow" style={{ borderRadius: "var(--radius-shell, 1.5rem)" }}>
          <ContextEngineCanvas />
        </div>

        <aside className="flex flex-col gap-3">
          {PIPELINE_STAGES.map((item, index) => {
            const selected = index === active;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(index)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  selected
                    ? "border-accent/70 bg-accent/10"
                    : "border-line bg-panel/40 hover:border-accent/40"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-accent-2">
                    {item.lane.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </button>
            );
          })}

          <AnimatePresence mode="wait">
            <motion.p
              key={stage.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-2 text-sm leading-6 text-muted"
            >
              {stage.note}
            </motion.p>
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}
