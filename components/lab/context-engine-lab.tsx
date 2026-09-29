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
    <div className="flex min-h-full flex-col bg-[#07080c] text-[#f4f1ea]">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-10">
        <div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-[#5ce1ff]">
            LAB / MOTION
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Notebook context engine
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link href="/" className="text-sm text-[#5ce1ff]">
            ← Notebook home
          </Link>
          <p className="max-w-md text-right text-sm leading-6 text-[#f4f1ea]/70">
            Scoped to this spike: git-backed collections, MCP writes, and
            build-time retrieval — not a generic product demo.
          </p>
        </div>
      </header>

      <div className="grid flex-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:p-8">
        <div className="relative min-h-[28rem] overflow-hidden rounded-[1.5rem] border border-white/10 bg-black shadow-[0_0_80px_rgba(92,225,255,0.08)]">
          <ContextEngineCanvas activeStageIndex={active} />
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
                    ? "border-[#5ce1ff]/70 bg-[#5ce1ff]/10"
                    : "border-white/10 bg-white/3 hover:border-white/25"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-[#e8a15a]">
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
              className="mt-2 text-sm leading-6 text-[#f4f1ea]/75"
            >
              {stage.note}
            </motion.p>
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}
