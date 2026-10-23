import { join } from "node:path";
import { contentRoot, findRepoRoot } from "@notebook/schema";
import { proposedDigestDir } from "@notebook/ingest";

export function repoRoot(): string {
  return process.env.NOTEBOOK_ROOT ?? findRepoRoot();
}

export function contentDir(): string {
  return contentRoot(repoRoot());
}

export function collectionFile(collection: string, slug: string): string {
  return join(contentDir(), collection, `${slug}.md`);
}

export function inboxFile(): string {
  return join(contentDir(), "links", "inbox.yaml");
}

export function digestFile(slug: string): string {
  return join(contentDir(), "digest", `${slug}.md`);
}

export function digestSpecFile(slug: string): string {
  return join(proposedDigestDir(), `${slug}.json`);
}
