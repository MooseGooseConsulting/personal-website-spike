"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { HashScroll } from "@/components/hash-scroll";
import { MarkdownBody } from "@/components/markdown-body";
import { PageFrame } from "@/components/page-frame";
import { RelatedRail } from "@/components/related-rail";
import { useSkin } from "@/components/providers/skin-provider";

export type DigestView = {
  slug: string;
  title: string;
  cadence: string;
  track: string;
  origin: string;
  date: string;
  summary: string;
  content: string;
  transcript?: string;
  audioUrl?: string;
  durationSec?: number;
  highlights: string[];
  items: { title: string; url: string; source?: string; category?: string }[];
};

function waveformPath(seed: string, width = 320, height = 64) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const pts: string[] = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const amp = 8 + (h % 22);
    const x = (i / n) * width;
    const y = height / 2 + (i % 2 === 0 ? -amp : amp);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export function DigestStage({ issues }: { issues: DigestView[] }) {
  const { definition } = useSkin();
  const reduce = useReducedMotion();
  const [cadence, setCadence] = useState<string>("all");
  const [track, setTrack] = useState<string>("all");
  const [origin, setOrigin] = useState<string>("all");
  const [open, setOpen] = useState(issues[0]?.slug ?? "");
  const [playing, setPlaying] = useState(false);

  const filtered = useMemo(
    () =>
      issues.filter((issue) => {
        if (cadence !== "all" && issue.cadence !== cadence) return false;
        if (track !== "all" && issue.track !== track) return false;
        if (origin !== "all" && issue.origin !== origin) return false;
        return true;
      }),
    [cadence, issues, origin, track],
  );

  const current = filtered.find((issue) => issue.slug === open) ?? filtered[0];

  return (
    <PageFrame
      kicker="Digest"
      title="Issues with a player."
      lede="Filter by cadence, track, and origin. The waveform is a motion path; transcript is the source of truth until TTS exists."
      actions={
        <>
          {(["all", "weekly", "daily", "monthly"] as const).map((value) => (
            <FilterChip
              key={`c-${value}`}
              label={value === "all" ? "any cadence" : value}
              active={cadence === value}
              onClick={() => setCadence(value)}
            />
          ))}
          {(["all", "specialized", "general"] as const).map((value) => (
            <FilterChip
              key={`t-${value}`}
              label={value === "all" ? "any track" : value}
              active={track === value}
              onClick={() => setTrack(value)}
            />
          ))}
          {(["all", "manual", "auto"] as const).map((value) => (
            <FilterChip
              key={`o-${value}`}
              label={value === "all" ? "any origin" : value}
              active={origin === value}
              onClick={() => setOrigin(value)}
            />
          ))}
        </>
      }
    >
      <HashScroll />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ol className="relative flex flex-col gap-3">
          <AnimatePresence>
            {filtered.map((issue, i) => (
              <motion.li
                key={issue.slug}
                layout
                id={issue.slug}
                initial={reduce ? false : { y: 24 * (i + 1), opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={definition.motion}
                className={`scroll-mt-28 cursor-pointer border p-4 ${
                  current?.slug === issue.slug ? "border-accent bg-accent/10" : "border-line bg-panel/40"
                }`}
                style={{ borderRadius: "var(--radius-shell, 0.75rem)" }}
                onClick={() => {
                  setOpen(issue.slug);
                  setPlaying(false);
                }}
              >
                <p className="font-mono text-[10px] tracking-[0.16em] text-accent-2 uppercase">
                  {issue.cadence} · {issue.track} · {issue.origin}
                </p>
                <h2 className="mt-1 text-lg">{issue.title}</h2>
                <p className="mt-1 text-sm text-muted">{issue.summary}</p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>

        {current ? (
          <motion.article
            key={current.slug}
            layout
            className="border border-line bg-panel/30 p-5"
            style={{ borderRadius: "var(--radius-shell, 1rem)" }}
          >
            <p className="font-mono text-[10px] tracking-[0.18em] text-accent uppercase">Player</p>
            <h2 className="font-display mt-2 text-3xl">{current.title}</h2>
            <svg viewBox="0 0 320 64" className="mt-4 h-16 w-full text-accent" aria-hidden>
              <motion.path
                d={waveformPath(current.slug + (current.transcript ?? ""))}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: playing || reduce ? 1 : 0.35 }}
                transition={{ duration: playing ? 8 : 1.2, ease: "easeInOut" }}
              />
            </svg>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                className="border border-line bg-accent px-4 py-2 text-sm text-background"
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? "Pause path" : "Play waveform"}
              </button>
              {current.audioUrl ? (
                <audio
                  className="h-9 w-full max-w-sm"
                  src={current.audioUrl}
                  controls
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                />
              ) : (
                <p className="font-mono text-[11px] text-muted">No audio clip yet — transcript below.</p>
              )}
            </div>
            {current.highlights.length ? (
              <ul className="mt-4 list-disc pl-5 text-sm leading-6 text-muted">
                {current.highlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}
            <MarkdownBody source={current.content} />
            {current.transcript ? (
              <section className="mt-6">
                <h3 className="font-mono text-[11px] tracking-[0.18em] text-accent-2 uppercase">Transcript</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted">{current.transcript}</p>
              </section>
            ) : null}
            <RelatedRail nodeId={`digest:${current.slug}`} />
          </motion.article>
        ) : (
          <p className="text-muted">No issues match those filters.</p>
        )}
      </div>
    </PageFrame>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase ${
        active ? "border-accent bg-accent/15" : "border-line text-muted"
      }`}
      style={{ borderRadius: "var(--radius-shell, 0.4rem)" }}
    >
      {label}
    </button>
  );
}
