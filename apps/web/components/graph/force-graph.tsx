"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSkin } from "@/components/providers/skin-provider";
import type { SkinId } from "@/lib/skins";
import { seedNodes, settle, stepSim, type SimEdge, type SimNode } from "@/components/graph/force-sim";

export type OverlayNode = {
  id: string;
  label: string;
  type: string;
  href?: string;
  weight?: number;
  peek?: string;
};

export type OverlayEdge = {
  source: string;
  target: string;
};

type Trail = { x: number; y: number; life: number; hue: number };

function readVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function typeColor(type: string, accent: string, accent2: string, fg: string) {
  if (type === "project" || type === "post" || type === "lab" || type === "digest") return accent;
  if (type === "topic" || type === "concept" || type === "talk" || type === "art") return accent2;
  return fg;
}

export function ForceGraph({
  nodes,
  edges,
  hiddenIds,
  layoutIdFor,
  focusedId,
  onFocus,
  className = "",
  variant = "explorer",
  trails = true,
}: {
  nodes: OverlayNode[];
  edges: OverlayEdge[];
  hiddenIds?: ReadonlySet<string>;
  layoutIdFor?: (id: string) => string | undefined;
  focusedId?: string | null;
  onFocus?: (id: string | null) => void;
  className?: string;
  variant?: "hero" | "explorer" | "full";
  trails?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<SimNode[]>([]);
  const trailsRef = useRef<Trail[]>([]);
  const cameraRef = useRef({ x: 0, y: 0, scale: 1, tx: 0, ty: 0, ts: 1 });
  const dragRef = useRef<{ px: number; py: number; cx: number; cy: number } | null>(null);
  const { skin, definition } = useSkin();
  const reduce = useReducedMotion();
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [size, setSize] = useState({ w: 640, h: 480 });
  const hidden = hiddenIds ?? EMPTY;
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const simEdges: SimEdge[] = useMemo(
    () => edges.filter((edge) => nodes.some((n) => n.id === edge.source) && nodes.some((n) => n.id === edge.target)),
    [edges, nodes],
  );

  const nodeKey = nodes.map((n) => n.id).join("|");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const resize = () => {
      const w = parent.clientWidth || 640;
      const h = parent.clientHeight || 480;
      setSize({ w, h });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!size.w) return;
    const prev = new Map(simRef.current.map((n) => [n.id, n]));
    const next = seedNodes(
      nodesRef.current.map((n) => ({ id: n.id, weight: n.weight })),
      size.w,
      size.h,
    );
    for (const node of next) {
      const old = prev.get(node.id);
      if (old) {
        node.x = old.x;
        node.y = old.y;
        node.vx = old.vx;
        node.vy = old.vy;
      }
    }
    if (reduce) settle(next, simEdges, size.w, size.h, 120);
    simRef.current = next;
    setPositions(Object.fromEntries(next.map((n) => [n.id, { x: n.x, y: n.y }])));
  }, [nodeKey, size.w, size.h, reduce, simEdges]);

  const focusLock = useCallback(
    (id: string) => {
      const node = simRef.current.find((n) => n.id === id);
      if (!node) return;
      cameraRef.current.tx = size.w / 2 - node.x * cameraRef.current.ts;
      cameraRef.current.ty = size.h / 2 - node.y * cameraRef.current.ts;
      onFocus?.(id);
    },
    [onFocus, size.h, size.w],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let running = true;
    let last = performance.now();
    let creature = 0;
    let publish = 0;

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const accent = readVar("--accent", "#3dfff2");
      const accent2 = readVar("--accent-2", "#d4783a");
      const fg = readVar("--foreground", "#f4f1ea");
      const bg = readVar("--background", "#05060a");

      if (!reduce) {
        creature += dt;
        stepSim(simRef.current, simEdges, size.w, size.h, dt, {
          creature: variant === "hero" ? creature : creature * 0.35,
          charge: variant === "full" ? 2800 : 2200,
        });
      }

      const cam = cameraRef.current;
      if (variant === "full" && !reduce) {
        cam.x += (cam.tx - cam.x) * 0.08;
        cam.y += (cam.ty - cam.y) * 0.08;
        cam.scale += (cam.ts - cam.scale) * 0.08;
      } else {
        cam.x = 0;
        cam.y = 0;
        cam.scale = 1;
      }

      ctx.fillStyle = bg;
      ctx.globalAlpha = variant === "hero" ? 0.35 : 0.55;
      ctx.fillRect(0, 0, size.w, size.h);
      ctx.globalAlpha = 1;
      paintBackdrop(ctx, size.w, size.h, skin, now, accent, accent2);

      ctx.save();
      ctx.translate(cam.x, cam.y);
      ctx.scale(cam.scale, cam.scale);

      const lookup = new Map(simRef.current.map((n) => [n.id, n]));
      for (const edge of simEdges) {
        const a = lookup.get(edge.source);
        const b = lookup.get(edge.target);
        if (!a || !b) continue;
        const pulse = reduce ? 0.35 : 0.22 + 0.2 * Math.sin(now / 700 + a.x * 0.01);
        ctx.strokeStyle = skin === "print-disrupt" ? accent : accent;
        ctx.globalAlpha = pulse;
        ctx.lineWidth = skin === "print-disrupt" ? 1.6 : 1.1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        if (skin === "spatial-atlas") {
          ctx.quadraticCurveTo(size.w / 2, size.h / 2, b.x, b.y);
        } else {
          ctx.lineTo(b.x, b.y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (trails && !reduce) {
        for (const edge of simEdges) {
          const a = lookup.get(edge.source);
          const b = lookup.get(edge.target);
          if (!a || !b) continue;
          const t = ((now / 1400) * (0.4 + (a.weight % 1))) % 1;
          trailsRef.current.push({
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t,
            life: 1,
            hue: edge.source.length % 2,
          });
        }
        trailsRef.current = trailsRef.current.filter((p) => p.life > 0.04);
        for (const p of trailsRef.current) {
          p.life *= 0.94;
          ctx.fillStyle = p.hue ? accent2 : accent;
          ctx.globalAlpha = p.life * 0.7;
          ctx.beginPath();
          ctx.arc(p.x, p.y, skin === "foundry-glass" ? 2.8 : 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      for (const node of simRef.current) {
        if (hidden.has(node.id)) {
          ctx.fillStyle = accent;
          ctx.globalAlpha = 0.18;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          continue;
        }
        const meta = nodesRef.current.find((n) => n.id === node.id);
        const color = typeColor(meta?.type ?? "", accent, accent2, fg);
        const r = 5 + node.weight * 2.2;
        const isFocus = focusedId === node.id;
        if (skin === "foundry-glass" || isFocus) {
          ctx.shadowColor = color;
          ctx.shadowBlur = isFocus ? 28 : 14;
        }
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        if (skin === "print-disrupt") {
          ctx.rect(node.x - r, node.y - r, r * 2, r * 2);
        } else if (skin === "ink-voltage") {
          ctx.moveTo(node.x, node.y - r);
          ctx.lineTo(node.x + r, node.y);
          ctx.lineTo(node.x, node.y + r);
          ctx.lineTo(node.x - r, node.y);
          ctx.closePath();
        } else {
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      if (now - publish > 32) {
        publish = now;
        const camNow = cameraRef.current;
        setPositions(
          Object.fromEntries(
            simRef.current.map((n) => [
              n.id,
              {
                x: n.x * camNow.scale + camNow.x,
                y: n.y * camNow.scale + camNow.y,
              },
            ]),
          ),
        );
      }

      if (!reduce) raf = requestAnimationFrame(tick);
    };

    if (reduce) {
      tick(performance.now());
    } else {
      raf = requestAnimationFrame(tick);
    }
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [focusedId, hidden, reduce, simEdges, size.h, size.w, skin, trails, variant]);

  useEffect(() => {
    if (variant !== "full") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const cam = cameraRef.current;
      const next = Math.min(2.4, Math.max(0.55, cam.ts * (event.deltaY > 0 ? 0.92 : 1.08)));
      cam.ts = next;
    };
    const onDown = (event: PointerEvent) => {
      dragRef.current = {
        px: event.clientX,
        py: event.clientY,
        cx: cameraRef.current.tx,
        cy: cameraRef.current.ty,
      };
      canvas.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      cameraRef.current.tx = drag.cx + (event.clientX - drag.px);
      cameraRef.current.ty = drag.cy + (event.clientY - drag.py);
    };
    const onUp = () => {
      dragRef.current = null;
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    return () => {
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
    };
  }, [variant]);

  return (
    <div className={className}>
      <div className="relative h-full w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" aria-hidden />
        {nodes.map((node) => {
        if (hidden.has(node.id)) return null;
        const pos = positions[node.id];
        if (!pos) return null;
        const layoutId = layoutIdFor?.(node.id);
        const focused = focusedId === node.id;
        const inner = (
          <span className="block max-w-[9rem] truncate px-1.5 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase">
            {node.label}
          </span>
        );
        return (
          <motion.div
            key={node.id}
            layoutId={layoutId}
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 border border-line bg-background/80 backdrop-blur-sm ${
              focused ? "text-accent shadow-glow" : "text-foreground"
            }`}
            style={{
              left: pos.x,
              top: pos.y,
              borderRadius: "var(--radius-shell, 0.35rem)",
            }}
            transition={definition.motion}
            onClick={() => {
              if (variant === "full") focusLock(node.id);
              onFocus?.(node.id);
            }}
          >
            {node.href ? (
              <Link href={node.href} className="block hover:text-accent">
                {inner}
              </Link>
            ) : (
              <button type="button" className="block text-left">
                {inner}
              </button>
            )}
          </motion.div>
        );
      })}
      </div>
    </div>
  );
}

const EMPTY = new Set<string>();

function paintBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  skin: SkinId,
  now: number,
  accent: string,
  accent2: string,
) {
  if (skin === "ink-voltage") {
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.08;
    const offset = (now / 40) % 12;
    for (let y = -12; y < h; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y + offset);
      ctx.lineTo(w, y + offset);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (skin === "spatial-atlas") {
    const g = ctx.createRadialGradient(w * 0.7, h * 0.3, 20, w * 0.7, h * 0.3, w * 0.6);
    g.addColorStop(0, accent);
    g.addColorStop(1, "transparent");
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  } else if (skin === "foundry-glass") {
    const g = ctx.createRadialGradient(w * 0.2, 0, 10, w * 0.2, 0, h);
    g.addColorStop(0, accent);
    g.addColorStop(1, "transparent");
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = accent2;
    ctx.globalAlpha = 0.04;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }
}
