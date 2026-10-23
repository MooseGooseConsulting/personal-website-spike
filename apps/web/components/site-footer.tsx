"use client";

import { motion } from "motion/react";
import { useSkin } from "@/components/providers/skin-provider";

export function SiteFooter() {
  const { definition } = useSkin();

  return (
    <motion.footer
      layout
      className="relative z-10 mt-auto border-t border-line px-5 py-6 pb-28 text-sm text-muted sm:px-8"
      transition={definition.motion}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p>
          Git is the CMS. Collections are the graph.{" "}
          <a href="/graph" className="text-accent">
            Full map
          </a>
          .
        </p>
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase">
          Hendersonville / Nashville · MooseGoose
        </p>
      </div>
    </motion.footer>
  );
}
