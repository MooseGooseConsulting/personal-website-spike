import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { findRepoRoot } from "@notebook/schema";

export function repoRoot(): string {
  return process.env.NOTEBOOK_ROOT ?? findRepoRoot();
}

export function varDir(): string {
  return join(repoRoot(), "var");
}

export function ingestDbPath(): string {
  return process.env.INGEST_DB ?? join(varDir(), "ingest.sqlite");
}

export function proposedDigestDir(): string {
  return join(varDir(), "digest", "proposed");
}

export function audioStubDir(): string {
  return join(repoRoot(), "apps", "web", "public", "audio", "digest");
}

export function feedsPath(): string {
  return join(repoRoot(), "packages", "ingest", "feeds.yaml");
}

export function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

export function ensureParent(file: string): void {
  mkdirSync(dirname(file), { recursive: true });
}
