"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { relatedLanes } from "@/lib/graph-data";
import { useSkin } from "@/components/providers/skin-provider";

function isInternal(url: string) {
  return url.startsWith("/");
}

export function RelatedRail({
  nodeId,
  compact = false,
}: {
  nodeId: string;
  compact?: boolean;
}) {
  const lanes = relatedLanes(nodeId);
  const { definition } = useSkin();
  if (!lanes) return null;
  const fused = lanes.fused.slice(0, compact ? 3 : 5);
  if (!fused.length) return null;

  return (
    <motion.aside
      layout
      className="mt-4 border-t border-line/70 pt-3"
      transition={definition.motion}
    >
      <p className="font-mono text-[10px] tracking-[0.2em] text-accent-2 uppercase">
        Related · RRF
      </p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {fused.map((item, i) => {
          const href = item.url;
          const inner = (
            <>
              <span className="font-mono text-[9px] tracking-[0.14em] text-muted uppercase">
                {item.kind}
              </span>
              <span className="text-sm text-foreground">{item.title}</span>
            </>
          );
          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...definition.motion, delay: i * definition.stagger }}
            >
              {isInternal(href) ? (
                <Link href={href} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 hover:text-accent">
                  {inner}
                </Link>
              ) : (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 hover:text-accent"
                >
                  {inner}
                </a>
              )}
            </motion.li>
          );
        })}
      </ul>
    </motion.aside>
  );
}
