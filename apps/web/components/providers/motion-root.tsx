"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { SkinProvider, useSkin } from "@/components/providers/skin-provider";
import { SiteShell } from "@/components/site-shell";

function MotionWithSkin({ children }: { children: ReactNode }) {
  const { definition } = useSkin();
  return (
    <MotionConfig reducedMotion="user" transition={definition.motion}>
      <SiteShell>{children}</SiteShell>
    </MotionConfig>
  );
}

export function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <SkinProvider>
      <MotionWithSkin>{children}</MotionWithSkin>
    </SkinProvider>
  );
}
