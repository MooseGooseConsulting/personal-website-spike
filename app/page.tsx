import Link from "next/link";

const NAV = [
  ["Work", "/work"],
  ["Library", "/library"],
  ["Radar", "/radar"],
  ["Digest", "/digest"],
  ["Lab", "/lab/context-engine"],
] as const;

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-[#07080c] text-[#f4f1ea]">
      <header className="flex items-center justify-between gap-6 px-6 py-5 sm:px-10">
        <p className="font-mono text-[11px] tracking-[0.22em] text-[#5ce1ff]">
          PATRICK MACLYMAN
        </p>
        <nav className="flex flex-wrap gap-4 text-sm text-[#f4f1ea]/70">
          {NAV.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="hover:text-[#5ce1ff]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16 sm:px-10">
        <p className="font-mono text-[11px] tracking-[0.22em] text-[#e8a15a]">
          PERSONAL NOTEBOOK SPIKE
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          A typed knowledge graph that agents can keep humming.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#f4f1ea]/75">
          Git is the CMS. Collections are the graph. This first slice is the
          Lab motion piece: how radar, MCP writes, schema, related-links, and
          the git gate move context through the notebook.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/lab/context-engine"
            className="rounded-full bg-[#5ce1ff] px-5 py-3 text-sm font-medium text-[#07080c]"
          >
            Open context engine
          </Link>
          <span className="rounded-full border border-white/15 px-5 py-3 text-sm text-[#f4f1ea]/50">
            Work / Library / Radar still TODO
          </span>
        </div>
      </main>
    </div>
  );
}
