import type { Transition } from "motion/react";

export const SKIN_IDS = [
  "ink-voltage",
  "spatial-atlas",
  "foundry-glass",
  "print-disrupt",
] as const;

export type SkinId = (typeof SKIN_IDS)[number];

export const DEFAULT_SKIN: SkinId = "ink-voltage";
export const SKIN_STORAGE_KEY = "notebook-skin";
export const DOCK_STORAGE_KEY = "notebook-skin-dock";

export type SkinDefinition = {
  id: SkinId;
  name: string;
  tag: string;
  swatch: string;
  motion: Transition;
  stagger: number;
  page: {
    initial: { opacity: number; y?: number; rotateY?: number; scale?: number; filter?: string };
    animate: { opacity: number; y?: number; rotateY?: number; scale?: number; filter?: string };
    exit: { opacity: number; y?: number; rotateY?: number; scale?: number; filter?: string };
  };
};

export const SKINS: Record<SkinId, SkinDefinition> = {
  "ink-voltage": {
    id: "ink-voltage",
    name: "Ink Voltage",
    tag: "kinetic / cyan-copper",
    swatch: "#3dfff2",
    motion: { type: "spring", stiffness: 420, damping: 28, mass: 0.65 },
    stagger: 0.04,
    page: {
      initial: { opacity: 0, y: 28, filter: "blur(8px)" },
      animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      exit: { opacity: 0, y: -16, filter: "blur(6px)" },
    },
  },
  "spatial-atlas": {
    id: "spatial-atlas",
    name: "Spatial Atlas",
    tag: "orbit / chrome",
    swatch: "#c8d4e8",
    motion: { type: "spring", stiffness: 80, damping: 18, mass: 1.15 },
    stagger: 0.08,
    page: {
      initial: { opacity: 0, scale: 0.92, rotateY: 18 },
      animate: { opacity: 1, scale: 1, rotateY: 0 },
      exit: { opacity: 0, scale: 1.04, rotateY: -12 },
    },
  },
  "foundry-glass": {
    id: "foundry-glass",
    name: "Foundry Glass",
    tag: "cinematic / volumetric",
    swatch: "#e8c36a",
    motion: { type: "spring", stiffness: 140, damping: 22, mass: 1 },
    stagger: 0.07,
    page: {
      initial: { opacity: 0, y: 40, filter: "blur(18px)" },
      animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      exit: { opacity: 0, filter: "blur(14px)" },
    },
  },
  "print-disrupt": {
    id: "print-disrupt",
    name: "Print Disrupt",
    tag: "editorial / ink-bleed",
    swatch: "#1a1a1a",
    motion: { type: "tween", duration: 0.55, ease: [0.76, 0, 0.24, 1] },
    stagger: 0.05,
    page: {
      initial: { opacity: 0, rotateY: -88, scale: 0.96 },
      animate: { opacity: 1, rotateY: 0, scale: 1 },
      exit: { opacity: 0, rotateY: 72, scale: 0.98 },
    },
  },
};

export const SKIN_LIST = SKIN_IDS.map((id) => SKINS[id]);

export function isSkinId(value: string | null | undefined): value is SkinId {
  return SKIN_IDS.includes(value as SkinId);
}
