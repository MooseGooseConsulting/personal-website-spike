"use client";

import { useEffect, useRef } from "react";
import { GRAPH_EDGES, GRAPH_NODES, PIPELINE_STAGES, type GraphNodeId } from "@/lib/notebook-pipeline";

type Particle = {
  t: number;
  speed: number;
  from: number;
  to: number;
  hue: number;
};

type NodePos = { x: number; y: number; anchorX: number; anchorY: number; vx: number; vy: number };

const KIND_COLOR: Record<string, string> = {
  project: "#5ce1ff",
  topic: "#e8a15a",
  output: "#d4fff0",
};

export function ContextEngineCanvas({ activeStageIndex }: { activeStageIndex: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeStageRef = useRef(activeStageIndex);
  const redrawRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    activeStageRef.current = activeStageIndex;
    redrawRef.current?.();
  }, [activeStageIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = true;

    const positions: NodePos[] = GRAPH_NODES.map((_, i) => {
      const angle = (i / GRAPH_NODES.length) * Math.PI * 2 - Math.PI / 2;
      return {
        x: Math.cos(angle) * 0.32,
        y: Math.sin(angle) * 0.38,
        anchorX: Math.cos(angle) * 0.32,
        anchorY: Math.sin(angle) * 0.38,
        vx: 0,
        vy: 0,
      };
    });

    const nodeIndex = (id: GraphNodeId) => GRAPH_NODES.findIndex((n) => n.id === id);

    const particles: Particle[] = Array.from({ length: 28 }, (_, i) => {
      const edge = GRAPH_EDGES[i % GRAPH_EDGES.length];
      return {
        t: Math.random(),
        speed: 0.08 + Math.random() * 0.12,
        from: nodeIndex(edge[0]),
        to: nodeIndex(edge[1]),
        hue: i % 3,
      };
    });

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth ?? 800;
      const h = parent?.clientHeight ?? 520;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    let last = performance.now();

    const tick = (now: number, scheduleNext = true) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w * 0.5;
      const cy = h * 0.52;
      const scale = Math.min(w, h) * 0.92;

      ctx.fillStyle = "#07080c";
      ctx.fillRect(0, 0, w, h);

      const grid = ctx.createLinearGradient(0, 0, w, h);
      grid.addColorStop(0, "rgba(92, 225, 255, 0.04)");
      grid.addColorStop(1, "rgba(232, 161, 90, 0.04)");
      ctx.fillStyle = grid;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let x = 40; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      if (!reduce) {
        GRAPH_NODES.forEach((_, i) => {
          const p = positions[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx += ((p.anchorX - p.x) * 0.4 - p.vx * 2.2) * dt;
          p.vy += ((p.anchorY - p.y) * 0.4 - p.vy * 2.2) * dt;
          const wobble = 0.018;
          p.vx += Math.sin(now / 900 + i) * wobble * dt;
          p.vy += Math.cos(now / 1100 + i * 1.3) * wobble * dt;
        });
      }

      const xy = (i: number) => ({
        x: cx + positions[i].x * scale,
        y: cy + positions[i].y * scale * 0.85,
      });

      ctx.lineCap = "round";
      GRAPH_EDGES.forEach(([a, b], ei) => {
        const ia = nodeIndex(a);
        const ib = nodeIndex(b);
        const pa = xy(ia);
        const pb = xy(ib);
        const pulse = reduce ? 0.35 : 0.25 + 0.2 * Math.sin(now / 600 + ei);
        ctx.strokeStyle = `rgba(92, 225, 255, ${pulse})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.quadraticCurveTo(cx, cy, pb.x, pb.y);
        ctx.stroke();
      });

      if (!reduce) {
        particles.forEach((p) => {
          p.t += p.speed * dt;
          if (p.t > 1) {
            p.t = 0;
            const edge = GRAPH_EDGES[Math.floor(Math.random() * GRAPH_EDGES.length)];
            p.from = nodeIndex(edge[0]);
            p.to = nodeIndex(edge[1]);
          }
          const pa = xy(p.from);
          const pb = xy(p.to);
          const t = p.t;
          const mx = (1 - t) * (1 - t) * pa.x + 2 * (1 - t) * t * cx + t * t * pb.x;
          const my = (1 - t) * (1 - t) * pa.y + 2 * (1 - t) * t * cy + t * t * pb.y;
          const colors = ["#5ce1ff", "#e8a15a", "#d4fff0"];
          ctx.fillStyle = colors[p.hue];
          ctx.shadowColor = colors[p.hue];
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(mx, my, 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      GRAPH_NODES.forEach((node, i) => {
        const p = xy(i);
        const color = KIND_COLOR[node.kind];
        ctx.beginPath();
        ctx.fillStyle = "rgba(7,8,12,0.9)";
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6;
        ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.label, p.x, p.y + 28);
      });

      const active = PIPELINE_STAGES[activeStageRef.current];
      ctx.fillStyle = "rgba(8, 10, 16, 0.72)";
      ctx.fillRect(16, 16, 280, 72);
      ctx.strokeStyle = "rgba(92, 225, 255, 0.35)";
      ctx.strokeRect(16, 16, 280, 72);
      ctx.fillStyle = "#5ce1ff";
      ctx.font = "600 11px ui-monospace, SFMono-Regular, monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("NOTEBOOK CONTEXT ENGINE", 28, 26);
      ctx.fillStyle = "#f4f1ea";
      ctx.font = "600 16px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(active.label, 28, 44);
      ctx.fillStyle = "rgba(244,241,234,0.55)";
      ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(active.lane.toUpperCase() + " lane", 28, 66);

      if (scheduleNext && !reduce) raf = requestAnimationFrame(tick);
    };

    redrawRef.current = () => tick(performance.now(), false);
    resize();
    const handleResize = () => {
      resize();
      if (reduce) redrawRef.current?.();
    };
    window.addEventListener("resize", handleResize);

    if (reduce) {
      redrawRef.current();
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      redrawRef.current = null;
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full rounded-[1.5rem]"
      aria-label="Animation of radar ingest, typed knowledge graph, related-link retrieval, and git publish"
    />
  );
}
