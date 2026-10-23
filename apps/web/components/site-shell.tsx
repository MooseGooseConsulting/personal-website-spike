"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import type { ReactNode } from "react";
import { useSkin } from "@/components/providers/skin-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkinDock } from "@/components/skin-dock";

export function SiteShell({ children }: { children: ReactNode }) {
  const { skin, definition } = useSkin();

  return (
    <LayoutGroup id="skin-switch">
      <div className="skin-stage flex min-h-full flex-col">
        <motion.div
          layoutId="skin-veil"
          className="pointer-events-none fixed inset-0 -z-10 bg-background"
          transition={definition.motion}
        />
        <SiteHeader />
        <div className="relative z-10 flex flex-1 flex-col" style={{ perspective: 1400 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={skin}
              layout
              className="flex flex-1 flex-col"
              initial={definition.page.initial}
              animate={definition.page.animate}
              exit={definition.page.exit}
              transition={definition.motion}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
        <SiteFooter />
        <SkinDock />
      </div>
    </LayoutGroup>
  );
}
