import { assertCorpusIntegrity, type NotebookCorpus } from "./integrity.ts";
import {
  bm25Query,
  buildBm25,
  rrf,
  semanticQuery,
  stubEmbed,
  tokenize,
  type Scored,
} from "./retrieval.ts";
import type {
  EdgeKind,
  GraphData,
  GraphEdge,
  GraphNode,
  NodeType,
  RelatedItem,
  RelatedLanes,
  RelatedMap,
} from "./types.ts";

const TOP_K = 6;

function nodeId(type: NodeType, slug: string): string {
  return `${type}:${slug}`;
}

function hrefFor(type: NodeType, slug: string, fallback?: string): string {
  if (fallback) return fallback;
  switch (type) {
    case "project":
      return `/work#${slug}`;
    case "topic":
    case "concept":
      return `/library#${slug}`;
    case "output":
    case "writing":
    case "post":
      return `/writing#${slug}`;
    case "talk":
      return `/talks#${slug}`;
    case "lab":
      return `/lab#${slug}`;
    case "art":
      return `/art#${slug}`;
    case "digest":
      return `/digest#${slug}`;
    case "cv":
      return `/cv#${slug}`;
  }
}

function pushEdge(
  edges: GraphEdge[],
  source: string,
  target: string,
  kind: EdgeKind,
): void {
  edges.push({
    id: `${source}~${target}~${kind}`,
    source,
    target,
    kind,
  });
}

function dedupeEdges(edges: GraphEdge[]): GraphEdge[] {
  const seen = new Set<string>();
  return edges.filter((edge) => {
    const key = [edge.source, edge.target].sort().join("::") + edge.kind;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildGraph(corpus: NotebookCorpus): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const topic of corpus.topics) {
    nodes.push({
      id: nodeId("topic", topic.slug),
      type: "topic",
      slug: topic.slug,
      label: topic.data.title,
      summary: topic.data.summary,
      url: hrefFor("topic", topic.slug),
      links: [],
      weight: topic.data.weight,
    });
    for (const related of topic.data.related) {
      pushEdge(edges, nodeId("topic", topic.slug), nodeId("topic", related), "topic-topic");
    }
  }

  for (const project of corpus.projects) {
    const links: GraphNode["links"] = [...project.data.links];
    if (project.data.repo) links.push({ label: "Code", url: project.data.repo });
    if (project.data.homepage) links.push({ label: "Live", url: project.data.homepage });
    nodes.push({
      id: nodeId("project", project.slug),
      type: "project",
      slug: project.slug,
      label: project.data.title,
      summary: project.data.summary,
      url: hrefFor("project", project.slug, project.data.homepage ?? project.data.repo),
      links,
      weight: project.data.featured ? 2 : 1.5,
    });
    for (const topic of project.data.topics) {
      pushEdge(edges, nodeId("project", project.slug), nodeId("topic", topic), "project-topic");
    }
    for (const output of project.data.outputs) {
      pushEdge(edges, nodeId("project", project.slug), nodeId("output", output), "project-output");
    }
    for (const related of project.data.related) {
      pushEdge(
        edges,
        nodeId("project", project.slug),
        nodeId("project", related),
        "project-project",
      );
    }
  }

  for (const output of corpus.outputs) {
    nodes.push({
      id: nodeId("output", output.slug),
      type: "output",
      slug: output.slug,
      label: output.data.title,
      summary: output.data.summary ?? "",
      url: output.data.url,
      links: [{ label: "Open", url: output.data.url }],
      kind: output.data.kind,
      weight: 1,
    });
    for (const topic of output.data.topics) {
      pushEdge(edges, nodeId("output", output.slug), nodeId("topic", topic), "output-topic");
    }
  }

  for (const concept of corpus.concepts) {
    nodes.push({
      id: nodeId("concept", concept.slug),
      type: "concept",
      slug: concept.slug,
      label: concept.data.label,
      summary: concept.data.definition,
      url: hrefFor("concept", concept.slug),
      links: [],
      weight: 1,
    });
    if (concept.data.topic) {
      pushEdge(
        edges,
        nodeId("concept", concept.slug),
        nodeId("topic", concept.data.topic),
        "concept-topic",
      );
    }
    for (const related of concept.data.related) {
      pushEdge(
        edges,
        nodeId("concept", concept.slug),
        nodeId("concept", related),
        "concept-concept",
      );
    }
  }

  for (const post of corpus.posts) {
    if (post.data.draft || post.data.unlisted) continue;
    nodes.push({
      id: nodeId("post", post.slug),
      type: "post",
      slug: post.slug,
      label: post.data.title,
      summary: post.data.description,
      url: hrefFor("post", post.slug, `/writing/${post.slug}`),
      links: [],
      kind: post.data.kind,
      weight: 1,
    });
    for (const topic of post.data.topics) {
      pushEdge(edges, nodeId("post", post.slug), nodeId("topic", topic), "post-topic");
    }
  }

  for (const writing of corpus.writing) {
    nodes.push({
      id: nodeId("writing", writing.slug),
      type: "writing",
      slug: writing.slug,
      label: writing.data.title,
      summary: writing.data.description,
      url: hrefFor("writing", writing.slug, writing.data.url),
      links: writing.data.url ? [{ label: "Open", url: writing.data.url }] : [],
      kind: writing.data.kind,
      weight: writing.data.featured ? 1.4 : 1,
    });
    for (const topic of writing.data.topics) {
      pushEdge(edges, nodeId("writing", writing.slug), nodeId("topic", topic), "writing-topic");
    }
  }

  for (const talk of corpus.talks) {
    nodes.push({
      id: nodeId("talk", talk.slug),
      type: "talk",
      slug: talk.slug,
      label: talk.data.title,
      summary: talk.data.description ?? "",
      url: hrefFor("talk", talk.slug),
      links: talk.data.links,
      kind: talk.data.kind,
      weight: 1,
    });
    for (const topic of talk.data.topics) {
      pushEdge(edges, nodeId("talk", talk.slug), nodeId("topic", topic), "talk-topic");
    }
  }

  for (const entry of corpus.lab) {
    nodes.push({
      id: nodeId("lab", entry.slug),
      type: "lab",
      slug: entry.slug,
      label: entry.data.title,
      summary: entry.data.summary,
      url: hrefFor("lab", entry.slug),
      links: entry.data.links,
      kind: entry.data.kind,
      weight: entry.data.featured ? 1.4 : 1,
    });
    for (const topic of entry.data.topics) {
      pushEdge(edges, nodeId("lab", entry.slug), nodeId("topic", topic), "lab-topic");
    }
  }

  for (const piece of corpus.art) {
    nodes.push({
      id: nodeId("art", piece.slug),
      type: "art",
      slug: piece.slug,
      label: piece.data.title,
      summary: piece.data.description ?? "",
      url: hrefFor("art", piece.slug),
      links: piece.data.links,
      kind: piece.data.medium,
      weight: 1,
    });
    for (const topic of piece.data.topics) {
      pushEdge(edges, nodeId("art", piece.slug), nodeId("topic", topic), "art-topic");
    }
  }

  for (const issue of corpus.digest) {
    nodes.push({
      id: nodeId("digest", issue.slug),
      type: "digest",
      slug: issue.slug,
      label: issue.data.title,
      summary: issue.data.summary,
      url: hrefFor("digest", issue.slug),
      links: [],
      kind: issue.data.cadence,
      weight: 1,
    });
    for (const topic of issue.data.topics) {
      pushEdge(edges, nodeId("digest", issue.slug), nodeId("topic", topic), "digest-topic");
    }
  }

  for (const entry of corpus.cv) {
    nodes.push({
      id: nodeId("cv", entry.slug),
      type: "cv",
      slug: entry.slug,
      label: entry.data.title,
      summary: entry.data.summary ?? "",
      url: hrefFor("cv", entry.slug),
      links: entry.data.links,
      kind: entry.data.category,
      weight: 0.8,
    });
    for (const topic of entry.data.topics) {
      pushEdge(edges, nodeId("cv", entry.slug), nodeId("topic", topic), "cv-topic");
    }
  }

  return { nodes, edges: dedupeEdges(edges) };
}

function adjacency(graph: GraphData): Map<string, Map<string, number>> {
  const adj = new Map<string, Map<string, number>>();
  const bump = (from: string, to: string) => {
    if (from === to) return;
    if (!adj.has(from)) adj.set(from, new Map());
    if (!adj.has(to)) adj.set(to, new Map());
    adj.get(from)!.set(to, (adj.get(from)!.get(to) ?? 0) + 1);
    adj.get(to)!.set(from, (adj.get(to)!.get(from) ?? 0) + 1);
  };
  for (const edge of graph.edges) bump(edge.source, edge.target);
  return adj;
}

function toItems(
  scored: Scored[],
  byId: Map<string, GraphNode>,
  limit: number,
): RelatedItem[] {
  const items: RelatedItem[] = [];
  for (const row of scored) {
    const node = byId.get(row.id);
    if (!node) continue;
    items.push({
      id: node.id,
      title: node.label,
      url: node.url ?? "#",
      kind: node.type,
      score: Math.round(row.score * 1000) / 1000,
    });
    if (items.length >= limit) break;
  }
  return items;
}

export function buildRelated(graph: GraphData, texts: Record<string, string>): RelatedMap {
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const bm25 = buildBm25(
    graph.nodes.map((node) => ({
      id: node.id,
      tokens: tokenize(texts[node.id] ?? `${node.label}. ${node.summary}`),
    })),
  );
  const vectors: Record<string, number[]> = {};
  for (const node of graph.nodes) {
    vectors[node.id] = stubEmbed(
      tokenize(texts[node.id] ?? `${node.label}. ${node.summary}`),
    );
  }
  const adj = adjacency(graph);
  const related: RelatedMap = {};

  for (const node of graph.nodes) {
    const text = texts[node.id] ?? `${node.label}. ${node.summary}`;
    const lexical = bm25Query(bm25, tokenize(text), node.id);
    const semantic = semanticQuery(vectors, vectors[node.id], node.id);
    const neighbors = adj.get(node.id);
    const graphLane: Scored[] = neighbors
      ? [...neighbors.entries()]
          .map(([id, score]) => ({ id, score }))
          .sort((a, b) => b.score - a.score)
      : [];
    const fused = rrf([lexical, semantic, graphLane]).filter((row) => row.id !== node.id);

    related[node.id] = {
      lexical: toItems(lexical, byId, TOP_K),
      semantic: toItems(semantic, byId, TOP_K),
      graph: toItems(graphLane, byId, TOP_K),
      fused: toItems(fused, byId, TOP_K),
    };
  }

  return related;
}

export function nodeTexts(corpus: NotebookCorpus): Record<string, string> {
  const texts: Record<string, string> = {};
  const add = (type: NodeType, slug: string, parts: (string | undefined)[]) => {
    texts[nodeId(type, slug)] = parts.filter(Boolean).join("\n");
  };

  for (const topic of corpus.topics) {
    add("topic", topic.slug, [topic.data.title, topic.data.summary, topic.data.content]);
  }
  for (const project of corpus.projects) {
    add("project", project.slug, [
      project.data.title,
      project.data.summary,
      project.data.content,
      project.data.tech.join(" "),
    ]);
  }
  for (const output of corpus.outputs) {
    add("output", output.slug, [output.data.title, output.data.summary, output.data.content]);
  }
  for (const concept of corpus.concepts) {
    add("concept", concept.slug, [
      concept.data.label,
      concept.data.definition,
      concept.data.content,
      concept.data.aliases.join(" "),
    ]);
  }
  for (const post of corpus.posts) {
    if (post.data.draft || post.data.unlisted) continue;
    add("post", post.slug, [post.data.title, post.data.description, post.data.content]);
  }
  for (const writing of corpus.writing) {
    add("writing", writing.slug, [writing.data.title, writing.data.description, writing.data.content]);
  }
  for (const talk of corpus.talks) {
    add("talk", talk.slug, [talk.data.title, talk.data.description, talk.data.content]);
  }
  for (const entry of corpus.lab) {
    add("lab", entry.slug, [entry.data.title, entry.data.summary, entry.data.content]);
  }
  for (const piece of corpus.art) {
    add("art", piece.slug, [piece.data.title, piece.data.description, piece.data.content]);
  }
  for (const issue of corpus.digest) {
    add("digest", issue.slug, [
      issue.data.title,
      issue.data.summary,
      issue.data.content,
      issue.data.transcript,
    ]);
  }
  for (const entry of corpus.cv) {
    add("cv", entry.slug, [
      entry.data.title,
      entry.data.org,
      entry.data.summary,
      entry.data.highlights.join(" "),
      entry.data.content,
    ]);
  }
  return texts;
}

export interface NotebookBuild {
  graph: GraphData;
  related: RelatedMap;
  stats: { nodes: number; edges: number; related: number };
}

export function buildNotebook(corpus: NotebookCorpus): NotebookBuild {
  assertCorpusIntegrity(corpus);
  const graph = buildGraph(corpus);
  const related = buildRelated(graph, nodeTexts(corpus));
  return {
    graph,
    related,
    stats: {
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      related: Object.keys(related).length,
    },
  };
}

export function emptyLanes(): RelatedLanes {
  return { lexical: [], semantic: [], graph: [], fused: [] };
}
