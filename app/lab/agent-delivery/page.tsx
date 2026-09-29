import Link from "next/link";

export const metadata = {
  title: "Agent delivery patterns — Lab",
  description:
    "Three interactive Archify diagrams separating observed OMO and LazyCodex behavior from a proposed repair-batch workflow.",
};

const diagrams = [
  {
    slug: "distribution",
    status: "SOURCE-BACKED ARCHITECTURE",
    title: "From OMO source to LazyCodex distribution",
    description:
      "Where reusable agent definitions, instructions, and dispatch behavior sit in the two inspected codebases.",
  },
  {
    slug: "ship-boundary",
    status: "SOURCE-BACKED WORKFLOW",
    title: "The ship boundary",
    description:
      "How LazyCodex instruction, hook behavior, review, and CI relate to a merge target. A hook is one mechanism, not the whole gate.",
  },
  {
    slug: "repair-batch",
    status: "PROPOSED WORKFLOW — NOT UPSTREAM BEHAVIOR",
    title: "One repair batch per PR revision",
    description:
      "A proposed way to combine CI failures, review findings, and branch drift before making the next coherent revision.",
  },
] as const;

export default function AgentDeliveryPage() {
  return (
    <main className="min-h-screen bg-[#07080c] px-6 py-10 text-[#f4f1ea] sm:px-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/lab" className="text-sm text-[#5ce1ff]">← Lab</Link>
        <p className="mt-12 font-mono text-xs tracking-[0.2em] text-[#e8a15a]">LAB / AGENT DELIVERY</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Inspect the delivery boundaries</h1>
        <p className="mt-4 max-w-3xl leading-7 text-[#f4f1ea]/70">
          The first two diagrams are based on pinned source snapshots. The third is an evaluation
          proposal, not a claim that either upstream project implements it. Open a diagram in its
          full-page viewer for its controls and detail.
        </p>
        <div className="mt-12 space-y-12">
          {diagrams.map((diagram) => (
            <section key={diagram.slug} className="overflow-hidden rounded-2xl border border-white/15 bg-white/3">
              <div className="flex flex-wrap items-end justify-between gap-5 p-6">
                <div className="max-w-3xl">
                  <p className="font-mono text-xs tracking-[0.16em] text-[#e8a15a]">{diagram.status}</p>
                  <h2 className="mt-3 text-2xl font-semibold">{diagram.title}</h2>
                  <p className="mt-2 leading-7 text-[#f4f1ea]/70">{diagram.description}</p>
                </div>
                <a
                  href={`/diagrams/${diagram.slug}.html`}
                  className="rounded-full border border-[#5ce1ff]/50 px-5 py-3 text-sm text-[#5ce1ff] hover:bg-[#5ce1ff]/10"
                >
                  Open full-page diagram ↗
                </a>
              </div>
              <iframe
                title={`${diagram.title} interactive preview`}
                src={`/diagrams/${diagram.slug}.html?embed=1`}
                loading="lazy"
                className="h-[28rem] w-full border-t border-white/10 bg-[#07080c] sm:h-[36rem]"
              />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
