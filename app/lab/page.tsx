import Link from "next/link";

export const metadata = {
  title: "Lab — Patrick MacLyman",
  description: "Interactive sketches and diagrams from the personal notebook lab.",
};

const experiments = [
  {
    href: "/lab/context-engine",
    eyebrow: "MOTION SKETCH",
    title: "Notebook context engine",
    description:
      "Follow the proposed notebook pipeline from radar inbox through typed graph, retrieval, and git gate.",
  },
  {
    href: "/lab/agent-delivery",
    eyebrow: "ARCHITECTURE DIAGRAMS",
    title: "Agent delivery patterns",
    description:
      "Inspect source-backed OMO and LazyCodex boundaries alongside a separately labeled repair-batch proposal.",
  },
] as const;

export default function LabPage() {
  return (
    <main className="min-h-screen bg-[#07080c] px-6 py-10 text-[#f4f1ea] sm:px-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-[#5ce1ff]">← Notebook home</Link>
        <p className="mt-12 font-mono text-xs tracking-[0.2em] text-[#e8a15a]">LAB</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Experiments and explanations</h1>
        <p className="mt-4 max-w-2xl text-[#f4f1ea]/70">
          Interactive views of systems and workflow ideas. Each page distinguishes observed source
          behavior from a proposal.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {experiments.map((experiment) => (
            <Link
              key={experiment.href}
              href={experiment.href}
              className="rounded-2xl border border-white/15 bg-white/3 p-6 transition hover:border-[#5ce1ff]/60 hover:bg-[#5ce1ff]/5"
            >
              <p className="font-mono text-xs tracking-[0.18em] text-[#e8a15a]">{experiment.eyebrow}</p>
              <h2 className="mt-4 text-2xl font-semibold">{experiment.title}</h2>
              <p className="mt-3 leading-7 text-[#f4f1ea]/70">{experiment.description}</p>
              <p className="mt-6 text-sm text-[#5ce1ff]">Open lab page →</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
