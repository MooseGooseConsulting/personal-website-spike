import Link from "next/link";

export default function Stub({
  title,
}: {
  title: string;
}) {
  return (
    <div className="flex min-h-full flex-col items-start justify-center bg-[#07080c] px-8 text-[#f4f1ea]">
      <p className="font-mono text-[11px] tracking-[0.22em] text-[#e8a15a]">
        TODO
      </p>
      <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
      <p className="mt-3 max-w-md text-[#f4f1ea]/70">
        Collection + graph route — not in this slice. The motion lab is live.
      </p>
      <Link href="/lab/context-engine" className="mt-8 text-[#5ce1ff]">
        Notebook context engine →
      </Link>
    </div>
  );
}
