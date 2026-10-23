import Link from "next/link";

export default function StubPage({
  title,
  note,
}: {
  title: string;
  note?: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-16 sm:px-8">
      <p className="font-mono text-[11px] tracking-[0.22em] text-accent-2 uppercase">
        TODO · later agent
      </p>
      <h1 className="font-display mt-3 text-4xl sm:text-6xl">{title}</h1>
      <p className="mt-5 max-w-md text-lg leading-7 text-muted">
        {note ??
          "Collection, graph, and motion for this route land in a later slice. The shell, skins, and Skin Dock are already live."}
      </p>
      <Link href="/" className="mt-8 text-accent">
        ← Home
      </Link>
    </main>
  );
}
