"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import { useSkin } from "@/components/providers/skin-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const { definition } = useSkin();

  return (
    <motion.header
      layout
      className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-8"
      transition={definition.motion}
    >
      <Link href="/" className="group">
        <p className="font-mono text-[10px] tracking-[0.28em] text-accent uppercase">
          Patrick MacLyman
        </p>
        <p className="mt-0.5 text-sm text-muted group-hover:text-foreground">
          notebook
        </p>
      </Link>
      <nav aria-label="Primary" className="flex flex-wrap gap-x-4 gap-y-2">
        {NAV.map(([label, href]) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className="relative px-0.5 text-sm text-muted hover:text-foreground"
            >
              {active ? (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-x-0 -bottom-1 h-px bg-accent"
                  transition={definition.motion}
                />
              ) : null}
              <span className={active ? "text-foreground" : undefined}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </motion.header>
  );
}
