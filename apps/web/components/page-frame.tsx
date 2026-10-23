"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useSkin } from "@/components/providers/skin-provider";

export function PageFrame({
  kicker,
  title,
  lede,
  actions,
  children,
  wide = false,
}: {
  kicker: string;
  title: string;
  lede?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  const { definition } = useSkin();

  return (
    <main
      className={`mx-auto flex w-full flex-1 flex-col gap-10 px-5 py-12 sm:px-8 sm:py-16 ${
        wide ? "max-w-7xl" : "max-w-6xl"
      }`}
    >
      <header className="max-w-3xl">
        <motion.p
          layout
          className="font-mono text-[11px] tracking-[0.28em] text-accent-2 uppercase"
        >
          {kicker}
        </motion.p>
        <motion.h1
          layoutId="skin-headline"
          className="font-display mt-3 text-4xl sm:text-6xl"
          transition={definition.motion}
        >
          {title}
        </motion.h1>
        {lede ? (
          <motion.div
            layout
            className="mt-5 max-w-xl text-lg leading-8 text-muted"
            transition={definition.motion}
          >
            {lede}
          </motion.div>
        ) : null}
        {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
      </header>
      {children}
    </main>
  );
}
