import { pathToFileURL } from "node:url";
import { listCandidates, openIngestDb } from "./db.ts";
import { ingestFeeds, ingestUrl } from "./radar.ts";
import { renderAllSilentStubs, renderSilentStub } from "./tts.ts";

function flag(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

function has(args: string[], name: string): boolean {
  return args.includes(name);
}

export async function runIngestCli(argv = process.argv.slice(2)): Promise<void> {
  const [cmd = "help", ...rest] = argv;

  if (cmd === "radar") {
    const url = flag(rest, "--url");
    const category = flag(rest, "--category") ?? "Inbox";
    const limit = Number(flag(rest, "--limit") ?? "25");
    const result = url ? await ingestUrl(url, category) : await ingestFeeds(limit);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (cmd === "list") {
    const status = flag(rest, "--status") ?? "new";
    const limit = Number(flag(rest, "--limit") ?? "50");
    const rows = listCandidates(openIngestDb(), status, limit);
    console.log(JSON.stringify({ count: rows.length, candidates: rows }, null, 2));
    return;
  }

  if (cmd === "tts-render") {
    const slug = flag(rest, "--slug");
    const result = slug ? [renderSilentStub(slug)] : has(rest, "--all") ? renderAllSilentStubs() : null;
    if (!result) {
      console.error("usage: tts-render --slug <digest-slug> | --all");
      process.exitCode = 1;
      return;
    }
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`@notebook/ingest

commands:
  radar [--url <https://...>] [--category Inbox] [--limit 25]
  list [--status new] [--limit 50]
  tts-render --slug <digest-slug> | --all

SQLite working set: var/ingest.sqlite (gitignored)
Audio stubs: apps/web/public/audio/digest/<slug>.stub.wav (silent; Kokoro skipped)
`);
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entry) {
  await runIngestCli();
}
