export type NodeType =
  | "project"
  | "topic"
  | "output"
  | "concept"
  | "post"
  | "writing"
  | "talk"
  | "lab"
  | "art"
  | "digest"
  | "cv";

export type EdgeKind =
  | "project-topic"
  | "project-output"
  | "project-project"
  | "topic-topic"
  | "output-topic"
  | "concept-concept"
  | "concept-topic"
  | "post-topic"
  | "writing-topic"
  | "talk-topic"
  | "lab-topic"
  | "art-topic"
  | "digest-topic"
  | "cv-topic";

export interface GraphNode {
  id: string;
  type: NodeType;
  slug: string;
  label: string;
  summary: string;
  url?: string;
  links: { label: string; url: string }[];
  kind?: string;
  weight: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface RelatedItem {
  id: string;
  title: string;
  url: string;
  kind: NodeType;
  score: number;
}

export interface RelatedLanes {
  lexical: RelatedItem[];
  semantic: RelatedItem[];
  graph: RelatedItem[];
  fused: RelatedItem[];
}

export type RelatedMap = Record<string, RelatedLanes>;

export interface Slugged<T> {
  slug: string;
  data: T;
}

export interface IntegrityError {
  collection: string;
  slug: string;
  field: string;
  ref: string;
  target: string;
}
