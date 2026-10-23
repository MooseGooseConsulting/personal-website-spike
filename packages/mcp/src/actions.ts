import { existsSync, readFileSync } from "node:fs";
import {
  assertCorpusIntegrity,
  buildGraph,
  buildNotebook,
  collectIntegrityErrors,
  conceptSchema,
  digestItemSchema,
  digestSchema,
  formatIntegrityErrors,
  loadCorpus,
  outputSchema,
  parseInbox,
  projectSchema,
  radarInboxSchema,
  radarItemSchema,
  type DigestDoc,
  type NotebookCorpus,
  type RadarItem,
  type Slugged,
} from "@notebook/schema";
import {
  fetchPage,
  proposedDigestDir,
  renderSilentStub,
  repeatGuardHits,
} from "@notebook/ingest";
import { z } from "zod";
import { stripEmpty, writeJsonFile, writeMarkdown, writeYamlFile } from "./lib/markdown.ts";
import { collectionFile, contentDir, digestFile, digestSpecFile, inboxFile } from "./lib/repo.ts";
import { assertSlug, formatDay } from "./lib/slug.ts";

function upsertSlugged<T>(list: Slugged<T>[], slug: string, data: T): Slugged<T>[] {
  return [...list.filter((doc) => doc.slug !== slug), { slug, data }];
}

function integrityOrThrow(corpus: NotebookCorpus, force: boolean): string[] {
  const errors = collectIntegrityErrors(corpus);
  if (errors.length > 0 && !force) {
    throw new Error(`Refusing write; graph integrity failed:\n${formatIntegrityErrors(errors)}`);
  }
  return errors.map((error) => formatIntegrityErrors([error]));
}

function radarPlain(item: RadarItem): Record<string, unknown> {
  return stripEmpty({
    title: item.title,
    url: item.url,
    category: item.category,
    kind: item.kind,
    note: item.note,
    tags: item.tags,
    added: formatDay(item.added),
    featured: item.featured || undefined,
  }) as Record<string, unknown>;
}

export function listGraph(input: { type?: string; limit?: number } = {}) {
  const corpus = loadCorpus();
  const errors = collectIntegrityErrors(corpus);
  const graph = buildGraph(corpus);
  let nodes = input.type ? graph.nodes.filter((node) => node.type === input.type) : graph.nodes;
  if (input.limit) nodes = nodes.slice(0, input.limit);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = input.type
    ? graph.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
    : graph.edges;
  return {
    ok: errors.length === 0,
    integrityErrors: errors,
    stats: { nodes: graph.nodes.length, edges: graph.edges.length, shown: nodes.length },
    nodes,
    edges,
  };
}

export function getNode(input: { id?: string; type?: string; slug?: string }) {
  const corpus = loadCorpus();
  const { graph, related } = (() => {
    try {
      return buildNotebook(corpus);
    } catch {
      const graph = buildGraph(corpus);
      return { graph, related: {} as Record<string, never> };
    }
  })();

  const id =
    input.id ??
    (input.type && input.slug ? `${input.type}:${input.slug}` : undefined);
  if (!id) {
    throw new Error("Provide `id` (type:slug) or both `type` and `slug`.");
  }

  const node = graph.nodes.find((candidate) => candidate.id === id);
  if (!node) {
    const slugMatches = graph.nodes.filter((candidate) => candidate.slug === id || candidate.slug === input.slug);
    if (slugMatches.length === 1) {
      const match = slugMatches[0];
      return { node: match, related: related[match.id] ?? null };
    }
    if (slugMatches.length > 1) {
      throw new Error(
        `Ambiguous slug. Use a typed id such as project:coldsearch. Matches: ${slugMatches.map((n) => n.id).join(", ")}`,
      );
    }
    throw new Error(`No graph node for ${id}`);
  }
  return { node, related: related[node.id] ?? null };
}

export async function addRadarLink(input: {
  url: string;
  category?: string;
  kind?: RadarItem["kind"];
  tags?: string[];
  featured?: boolean;
  title?: string;
  note?: string;
  dryRun?: boolean;
}) {
  const page = await fetchPage(input.url);
  const item = radarItemSchema.parse({
    title: input.title?.trim() || page.title,
    url: page.finalUrl,
    category: input.category?.trim() || "Inbox",
    kind: input.kind ?? page.kind,
    note: input.note?.trim() || page.note,
    tags: input.tags ?? [],
    added: formatDay(new Date()),
    featured: input.featured ?? false,
  });

  const file = inboxFile();
  const existing = existsSync(file) ? parseInbox(readFileSync(file, "utf8")) : [];
  const duplicate = existing.find((row) => row.url === item.url);
  if (duplicate) {
    throw new Error(`URL already in radar inbox: ${item.url}`);
  }

  const next = radarInboxSchema.parse({ items: [...existing, item] });
  if (!input.dryRun) {
    writeYamlFile(file, { items: next.items.map(radarPlain) });
  }

  return {
    dryRun: Boolean(input.dryRun),
    file,
    fetched: { title: page.title, note: page.note, kind: page.kind, finalUrl: page.finalUrl },
    item: radarPlain(item),
    inboxCount: next.items.length,
  };
}

export function upsertProject(input: Record<string, unknown> & { slug: string; force?: boolean }) {
  const slug = assertSlug(input.slug);
  const body = typeof input.body === "string" ? input.body : "";
  const data = projectSchema.parse({
    ...input,
    content: body,
  });
  const corpus = loadCorpus();
  const next = { ...corpus, projects: upsertSlugged(corpus.projects, slug, data) };
  const warnings = integrityOrThrow(next, Boolean(input.force));
  const file = collectionFile("projects", slug);
  writeMarkdown(file, data as unknown as Record<string, unknown>, body);
  return { file, slug, warnings };
}

export function upsertOutput(input: Record<string, unknown> & { slug: string; force?: boolean }) {
  const slug = assertSlug(input.slug);
  const body = typeof input.body === "string" ? input.body : "";
  const data = outputSchema.parse({
    ...input,
    content: body,
  });
  const corpus = loadCorpus();
  const next = { ...corpus, outputs: upsertSlugged(corpus.outputs, slug, data) };
  const warnings = integrityOrThrow(next, Boolean(input.force));
  const file = collectionFile("outputs", slug);
  writeMarkdown(file, data as unknown as Record<string, unknown>, body);
  return { file, slug, warnings };
}

export function addConcept(input: Record<string, unknown> & { slug: string; force?: boolean }) {
  const slug = assertSlug(input.slug);
  const file = collectionFile("concepts", slug);
  if (existsSync(file) && !input.force) {
    throw new Error(`Concept already exists: ${slug}. Pass force=true to overwrite.`);
  }
  const body = typeof input.body === "string" ? input.body : "";
  const data = conceptSchema.parse({
    ...input,
    content: body,
  });
  const corpus = loadCorpus();
  const next = { ...corpus, concepts: upsertSlugged(corpus.concepts, slug, data) };
  const warnings = integrityOrThrow(next, Boolean(input.force));
  writeMarkdown(file, data as unknown as Record<string, unknown>, body);
  return { file, slug, warnings };
}

export const digestSpecSchema = z.object({
  slug: z.string(),
  title: z.string(),
  cadence: z.enum(["daily", "weekly", "monthly"]),
  track: z.enum(["specialized", "general"]).default("specialized"),
  origin: z.enum(["auto", "manual"]).default("auto"),
  date: z.string(),
  summary: z.string(),
  topics: z.array(z.string()).default([]),
  unresolvedFacets: z.array(z.string()).optional(),
  items: z.array(digestItemSchema).default([]),
  highlights: z.array(z.string()).default([]),
  transcript: z.string().min(1, "Digest transcript is required (audio may be a silent stub)."),
  body: z.string().min(1),
  audioUrl: z.string().optional(),
  durationSec: z.number().int().optional(),
  allowRepeat: z.boolean().optional(),
});

export type DigestSpec = z.infer<typeof digestSpecSchema>;

export function proposeDigest(input: unknown) {
  const spec = digestSpecSchema.parse(input);
  assertSlug(spec.slug);
  const repeats = spec.allowRepeat ? [] : repeatGuardHits(spec.items.map((item) => item.url));
  if (repeats.length > 0) {
    throw new Error(
      `Repeat-guard: these URLs already appeared in a published digest: ${repeats.join(", ")}. Pass allowRepeat=true to override.`,
    );
  }
  const file = digestSpecFile(spec.slug);
  writeJsonFile(file, spec);
  return { file, slug: spec.slug, proposedDir: proposedDigestDir(), itemCount: spec.items.length };
}

export function publishDigest(input: {
  slug?: string;
  specPath?: string;
  allowRepeat?: boolean;
  writeAudioStub?: boolean;
  force?: boolean;
}) {
  const slug = input.slug ? assertSlug(input.slug) : undefined;
  const specPath = input.specPath ?? (slug ? digestSpecFile(slug) : undefined);
  if (!specPath) {
    throw new Error("Provide `slug` or `specPath` for the proposed digest JSON.");
  }
  if (!existsSync(specPath)) {
    throw new Error(`No digest spec at ${specPath}. Run propose_digest first.`);
  }
  const spec = digestSpecSchema.parse(JSON.parse(readFileSync(specPath, "utf8")));
  const repeats = input.allowRepeat || spec.allowRepeat ? [] : repeatGuardHits(spec.items.map((item) => item.url));
  if (repeats.length > 0) {
    throw new Error(
      `Repeat-guard: these URLs already appeared in a published digest: ${repeats.join(", ")}. Pass allowRepeat=true to override.`,
    );
  }

  const data = digestSchema.parse({
    title: spec.title,
    cadence: spec.cadence,
    track: spec.track,
    origin: spec.origin,
    date: spec.date,
    summary: spec.summary,
    topics: spec.topics,
    unresolvedFacets: spec.unresolvedFacets,
    items: spec.items,
    highlights: spec.highlights,
    transcript: spec.transcript,
    audioUrl: spec.audioUrl,
    durationSec: spec.durationSec,
    content: spec.body,
  }) satisfies DigestDoc;

  const corpus = loadCorpus();
  const next = { ...corpus, digest: upsertSlugged(corpus.digest, spec.slug, data) };
  const warnings = integrityOrThrow(next, Boolean(input.force));
  const file = digestFile(spec.slug);
  writeMarkdown(file, data as unknown as Record<string, unknown>, spec.body);

  let audio: ReturnType<typeof renderSilentStub> | undefined;
  if (input.writeAudioStub !== false && !spec.audioUrl) {
    audio = renderSilentStub(spec.slug);
  }

  return { file, slug: spec.slug, specPath, warnings, audio, transcriptChars: spec.transcript.length };
}

export function validateSite() {
  const corpus = loadCorpus();
  const errors = collectIntegrityErrors(corpus);
  const counts = {
    projects: corpus.projects.length,
    topics: corpus.topics.length,
    concepts: corpus.concepts.length,
    outputs: corpus.outputs.length,
    writing: corpus.writing.length,
    posts: corpus.posts.length,
    talks: corpus.talks.length,
    art: corpus.art.length,
    lab: corpus.lab.length,
    cv: corpus.cv.length,
    digest: corpus.digest.length,
    links: corpus.links.length,
    library: corpus.library.length,
  };
  if (errors.length === 0) {
    assertCorpusIntegrity(corpus);
  }
  return {
    ok: errors.length === 0,
    counts,
    errors,
    contentRoot: contentDir(),
  };
}

type TodoHit = { collection: string; slug: string; todo: string };

function todosFrom(collection: string, docs: Slugged<{ TODO?: string }>[], hits: TodoHit[]): void {
  for (const doc of docs) {
    if (doc.data.TODO) hits.push({ collection, slug: doc.slug, todo: doc.data.TODO });
  }
}

export function listUnresolved() {
  const corpus = loadCorpus();
  const todos: TodoHit[] = [];
  todosFrom("projects", corpus.projects, todos);
  todosFrom("topics", corpus.topics, todos);
  todosFrom("concepts", corpus.concepts, todos);
  todosFrom("outputs", corpus.outputs, todos);
  todosFrom("writing", corpus.writing, todos);
  todosFrom("posts", corpus.posts, todos);
  todosFrom("talks", corpus.talks, todos);
  todosFrom("art", corpus.art, todos);
  todosFrom("lab", corpus.lab, todos);
  todosFrom("cv", corpus.cv, todos);
  todosFrom("digest", corpus.digest, todos);

  const conceptsMissingTopic = corpus.concepts
    .filter((doc) => !doc.data.topic)
    .map((doc) => ({ slug: doc.slug, label: doc.data.label }));

  const digestFacets = corpus.digest
    .filter((doc) => (doc.data.unresolvedFacets?.length ?? 0) > 0)
    .map((doc) => ({ slug: doc.slug, facets: doc.data.unresolvedFacets ?? [] }));

  const conceptLabels = new Set(
    corpus.concepts.flatMap((doc) => [doc.slug, doc.data.label.toLowerCase(), ...doc.data.aliases.map((a) => a.toLowerCase())]),
  );
  const orphanFacets = digestFacets.flatMap((issue) =>
    issue.facets
      .filter((facet) => !conceptLabels.has(facet) && !conceptLabels.has(facet.toLowerCase()))
      .map((facet) => ({ digest: issue.slug, facet })),
  );

  return {
    todos,
    conceptsMissingTopic,
    digestFacets,
    orphanFacets,
    radarWithoutNotes: corpus.links
      .filter((item) => !item.note)
      .map((item) => ({ url: item.url, title: item.title })),
  };
}
