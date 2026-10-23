import graphJson from "@notebook/schema/graph.json";
import relatedJson from "@notebook/schema/related.json";
import type { GraphData, GraphNode, NodeType, RelatedLanes, RelatedMap } from "@notebook/schema";

export const notebookGraph = graphJson as GraphData;
export const relatedMap = relatedJson as RelatedMap;

export function graphNode(id: string): GraphNode | undefined {
  return notebookGraph.nodes.find((node) => node.id === id);
}

export function nodeId(type: NodeType | string, slug: string): string {
  return `${type}:${slug}`;
}

export function relatedLanes(id: string): RelatedLanes | undefined {
  return relatedMap[id];
}

export function relatedFused(id: string, limit = 6) {
  return (relatedMap[id]?.fused ?? []).slice(0, limit);
}

/** Prefer an in-site hash/path so graph clicks stay in the notebook. */
export function siteHref(node: Pick<GraphNode, "type" | "slug" | "url">): string {
  if (node.url?.startsWith("/")) return node.url;
  switch (node.type) {
    case "project":
      return `/work#${node.slug}`;
    case "topic":
    case "concept":
      return `/library#${node.slug}`;
    case "output":
    case "writing":
      return `/writing#${node.slug}`;
    case "post":
      return `/writing/${node.slug}`;
    case "talk":
      return `/talks#${node.slug}`;
    case "lab":
      return `/lab#${node.slug}`;
    case "art":
      return `/art#${node.slug}`;
    case "digest":
      return `/digest#${node.slug}`;
    case "cv":
      return `/cv#${node.slug}`;
    default:
      return node.url ?? "/graph";
  }
}

export const TYPE_TINT: Record<string, string> = {
  project: "var(--accent)",
  topic: "var(--accent-2)",
  output: "var(--foreground)",
  concept: "var(--accent-2)",
  post: "var(--accent)",
  writing: "var(--accent)",
  talk: "var(--accent-2)",
  lab: "var(--accent)",
  art: "var(--accent-2)",
  digest: "var(--accent)",
  cv: "var(--foreground)",
};
