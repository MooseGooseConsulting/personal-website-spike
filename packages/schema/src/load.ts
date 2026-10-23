import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, parse as parsePath } from "node:path";
import matter from "gray-matter";
import { parse as parseYaml } from "yaml";
import type { NotebookCorpus } from "./integrity.ts";
import {
  artSchema,
  conceptSchema,
  cvSchema,
  digestSchema,
  explorerMapSchema,
  labSchema,
  outputSchema,
  postSchema,
  projectSchema,
  radarInboxSchema,
  talkSchema,
  topicSchema,
  writingSchema,
  type ExplorerMap,
  type RadarItem,
} from "./schemas.ts";
import type { Slugged } from "./types.ts";

export function findRepoRoot(start = process.cwd()): string {
  let dir = start;
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, "AGENTS.md")) && existsSync(join(dir, "content"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error("Could not find repo root (AGENTS.md + content/).");
}

export function contentRoot(start = process.cwd()): string {
  return join(findRepoRoot(start), "content");
}

function markdownFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .sort();
}

function loadMarkdown<T>(
  dir: string,
  schema: { parse: (data: unknown) => T },
): Slugged<T>[] {
  const docs: Slugged<T>[] = [];
  for (const file of markdownFiles(dir)) {
    const slug = parsePath(file).name;
    const raw = readFileSync(join(dir, file), "utf8");
    const parsed = matter(raw);
    const data = schema.parse({ ...parsed.data, content: parsed.content.trim() });
    docs.push({ slug, data });
  }
  return docs;
}

export function parseInbox(raw: string): RadarItem[] {
  const parsed: unknown = parseYaml(raw);
  const inbox =
    Array.isArray(parsed)
      ? radarInboxSchema.parse({ items: parsed })
      : radarInboxSchema.parse(parsed);
  return inbox.items;
}

function loadInbox(file: string): RadarItem[] {
  if (!existsSync(file)) return [];
  return parseInbox(readFileSync(file, "utf8"));
}

function loadExplorers(dir: string): ExplorerMap[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const parsed: unknown = JSON.parse(readFileSync(join(dir, file), "utf8"));
      return explorerMapSchema.parse(parsed);
    });
}

export function loadCorpus(root = contentRoot()): NotebookCorpus {
  return {
    projects: loadMarkdown(join(root, "projects"), projectSchema),
    topics: loadMarkdown(join(root, "topics"), topicSchema),
    concepts: loadMarkdown(join(root, "concepts"), conceptSchema),
    outputs: loadMarkdown(join(root, "outputs"), outputSchema),
    writing: loadMarkdown(join(root, "writing"), writingSchema),
    posts: loadMarkdown(join(root, "posts"), postSchema),
    talks: loadMarkdown(join(root, "talks"), talkSchema),
    art: loadMarkdown(join(root, "art"), artSchema),
    lab: loadMarkdown(join(root, "lab"), labSchema),
    cv: loadMarkdown(join(root, "cv"), cvSchema),
    digest: loadMarkdown(join(root, "digest"), digestSchema),
    links: loadInbox(join(root, "links", "inbox.yaml")),
    library: loadExplorers(join(root, "library", "explorers")),
  };
}
