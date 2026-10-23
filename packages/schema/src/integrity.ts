import type {
  ArtDoc,
  ConceptDoc,
  CvDoc,
  DigestDoc,
  ExplorerMap,
  LabDoc,
  OutputDoc,
  PostDoc,
  ProjectDoc,
  RadarItem,
  TalkDoc,
  TopicDoc,
  WritingDoc,
} from "./schemas.ts";
import type { IntegrityError, Slugged } from "./types.ts";

export interface NotebookCorpus {
  projects: Slugged<ProjectDoc>[];
  topics: Slugged<TopicDoc>[];
  concepts: Slugged<ConceptDoc>[];
  outputs: Slugged<OutputDoc>[];
  writing: Slugged<WritingDoc>[];
  posts: Slugged<PostDoc>[];
  talks: Slugged<TalkDoc>[];
  art: Slugged<ArtDoc>[];
  lab: Slugged<LabDoc>[];
  cv: Slugged<CvDoc>[];
  digest: Slugged<DigestDoc>[];
  links: RadarItem[];
  library: ExplorerMap[];
}

function indexSlugs(docs: { slug: string }[]): Set<string> {
  return new Set(docs.map((doc) => doc.slug));
}

function check(
  errors: IntegrityError[],
  collection: string,
  slug: string,
  field: string,
  refs: readonly string[] | undefined,
  available: Set<string>,
  target: string,
): void {
  for (const ref of refs ?? []) {
    if (!available.has(ref)) {
      errors.push({ collection, slug, field, ref, target });
    }
  }
}

export function collectIntegrityErrors(corpus: NotebookCorpus): IntegrityError[] {
  const topics = indexSlugs(corpus.topics);
  const projects = indexSlugs(corpus.projects);
  const outputs = indexSlugs(corpus.outputs);
  const concepts = indexSlugs(corpus.concepts);
  const posts = indexSlugs(corpus.posts);
  const explorerNodesByMap = new Map(
    corpus.library.map((map) => [map.id, new Set(map.nodes.map((node) => node.id))]),
  );

  const errors: IntegrityError[] = [];

  for (const project of corpus.projects) {
    check(errors, "projects", project.slug, "topics", project.data.topics, topics, "topics");
    check(errors, "projects", project.slug, "outputs", project.data.outputs, outputs, "outputs");
    check(errors, "projects", project.slug, "related", project.data.related, projects, "projects");
  }

  for (const topic of corpus.topics) {
    check(errors, "topics", topic.slug, "related", topic.data.related, topics, "topics");
  }

  for (const output of corpus.outputs) {
    check(errors, "outputs", output.slug, "topics", output.data.topics, topics, "topics");
  }

  for (const concept of corpus.concepts) {
    if (concept.data.topic && !topics.has(concept.data.topic)) {
      errors.push({
        collection: "concepts",
        slug: concept.slug,
        field: "topic",
        ref: concept.data.topic,
        target: "topics",
      });
    }
    check(errors, "concepts", concept.slug, "related", concept.data.related, concepts, "concepts");
  }

  for (const writing of corpus.writing) {
    if (writing.data.post && !posts.has(writing.data.post)) {
      errors.push({
        collection: "writing",
        slug: writing.slug,
        field: "post",
        ref: writing.data.post,
        target: "posts",
      });
    }
    check(errors, "writing", writing.slug, "topics", writing.data.topics, topics, "topics");
  }

  for (const post of corpus.posts) {
    check(errors, "posts", post.slug, "topics", post.data.topics, topics, "topics");
  }
  for (const talk of corpus.talks) {
    check(errors, "talks", talk.slug, "topics", talk.data.topics, topics, "topics");
  }
  for (const piece of corpus.art) {
    check(errors, "art", piece.slug, "topics", piece.data.topics, topics, "topics");
  }
  for (const entry of corpus.lab) {
    check(errors, "lab", entry.slug, "topics", entry.data.topics, topics, "topics");
    check(errors, "lab", entry.slug, "related", entry.data.related, indexSlugs(corpus.lab), "lab");
  }
  for (const entry of corpus.cv) {
    check(errors, "cv", entry.slug, "topics", entry.data.topics, topics, "topics");
  }
  for (const issue of corpus.digest) {
    check(errors, "digest", issue.slug, "topics", issue.data.topics, topics, "topics");
  }

  for (const map of corpus.library) {
    if (!topics.has(map.topic)) {
      errors.push({
        collection: "library",
        slug: map.id,
        field: "topic",
        ref: map.topic,
        target: "topics",
      });
    }
    const nodes = explorerNodesByMap.get(map.id) ?? new Set();
    for (const edge of map.edges) {
      if (!nodes.has(edge.source)) {
        errors.push({
          collection: "library",
          slug: map.id,
          field: "edges.source",
          ref: edge.source,
          target: "library-node",
        });
      }
      if (!nodes.has(edge.target)) {
        errors.push({
          collection: "library",
          slug: map.id,
          field: "edges.target",
          ref: edge.target,
          target: "library-node",
        });
      }
    }
  }

  return errors;
}

export function formatIntegrityErrors(errors: IntegrityError[]): string {
  return errors
    .map(
      (error) =>
        `Dangling edge: ${error.collection}/${error.slug} ${error.field} -> ${error.target}:${error.ref}`,
    )
    .join("\n");
}

export function assertCorpusIntegrity(corpus: NotebookCorpus): void {
  const errors = collectIntegrityErrors(corpus);
  if (errors.length > 0) {
    throw new Error(`Graph integrity failed:\n${formatIntegrityErrors(errors)}`);
  }
}

export function assertSlugRefs(
  collection: string,
  slug: string,
  field: string,
  refs: readonly string[] | undefined,
  available: Iterable<string>,
  target: string,
): void {
  const set = available instanceof Set ? available : new Set(available);
  const errors: IntegrityError[] = [];
  check(errors, collection, slug, field, refs, set, target);
  if (errors.length > 0) {
    throw new Error(formatIntegrityErrors(errors));
  }
}
