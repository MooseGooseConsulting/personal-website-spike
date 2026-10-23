"use client";

import { LayoutGroup, motion } from "motion/react";
import { SKIN_LIST } from "@/lib/skins";
import { useSkin } from "@/components/providers/skin-provider";

export function SkinDock() {
  const { skin, definition, dockOpen, setSkin, toggleDock } = useSkin();

  return (
    <LayoutGroup id="skin-dock">
      <motion.aside
        layout
        className="pointer-events-auto fixed bottom-4 left-1/2 z-50 w-[min(36rem,calc(100vw-1.5rem))] -translate-x-1/2"
        aria-label="Skin dock"
      >
        <motion.div
          layout
          className="overflow-hidden border border-line bg-panel/80 shadow-glow backdrop-blur-xl"
          style={{ borderRadius: "var(--radius-shell, 1rem)" }}
        >
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <button
              type="button"
              onClick={toggleDock}
              className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase"
              aria-expanded={dockOpen}
            >
              Skins · D
            </button>
            <motion.span
              layout
              className="truncate font-mono text-[10px] tracking-[0.16em] text-accent uppercase"
            >
              {definition.name}
            </motion.span>
          </div>

          {dockOpen ? (
            <motion.div
              layout
              className="grid grid-cols-2 gap-2 p-3 pt-0 sm:grid-cols-4"
            >
              {SKIN_LIST.map((item) => {
                const active = item.id === skin;
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    layout
                    onClick={() => setSkin(item.id)}
                    className="relative isolate min-h-[4.5rem] overflow-hidden border border-line px-3 py-2 text-left"
                    style={{ borderRadius: "var(--radius-shell, 0.75rem)" }}
                    aria-pressed={active}
                  >
                    {active ? (
                      <motion.span
                        layoutId="skin-dock-active"
                        className="absolute inset-0 -z-10 bg-accent/18"
                        style={{ borderRadius: "inherit" }}
                        transition={item.motion}
                      />
                    ) : null}
                    <span
                      className="mb-2 block size-3 rounded-full border border-line"
                      style={{ background: item.swatch }}
                    />
                    <span className="block text-xs font-medium text-foreground">
                      {item.name}
                    </span>
                    <span className="mt-0.5 block font-mono text-[9px] tracking-[0.12em] text-muted uppercase">
                      {item.tag}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : null}
        </motion.div>
      </motion.aside>
    </LayoutGroup>
  );
}
