export type PipelineStageId =
  | "radar"
  | "ingest"
  | "mcp"
  | "schema"
  | "rrf"
  | "git";

export const PIPELINE_STAGES: {
  id: PipelineStageId;
  label: string;
  lane: "in" | "core" | "out";
  note: string;
}[] = [
  {
    id: "radar",
    label: "Radar inbox",
    lane: "in",
    note: "YAML watchlist. Agents append links; they never invent the note.",
  },
  {
    id: "ingest",
    label: "Working set",
    lane: "in",
    note: "RSS / URL fetch lands in SQLite candidates before anything is published.",
  },
  {
    id: "mcp",
    label: "MCP write",
    lane: "core",
    note: "upsert_project, add_radar_link, propose_digest — schema-checked markdown.",
  },
  {
    id: "schema",
    label: "Typed graph",
    lane: "core",
    note: "projects ↔ topics ↔ outputs. Dangling edges fail the build.",
  },
  {
    id: "rrf",
    label: "Related-links",
    lane: "core",
    note: "Lexical + embedding stub + graph, fused with RRF at build time.",
  },
  {
    id: "git",
    label: "Git gate",
    lane: "out",
    note: "Commit is the CMS. The live site only moves when main is valid.",
  },
];

export const GRAPH_NODES = [
  { id: "coldsearch", kind: "project", label: "ColdSearch" },
  { id: "northstar", kind: "project", label: "NorthStar" },
  { id: "homelab", kind: "project", label: "Homelab" },
  { id: "agents", kind: "topic", label: "Agent harnesses" },
  { id: "gov", kind: "topic", label: "LLM governance" },
  { id: "risk", kind: "topic", label: "Model risk" },
  { id: "digest", kind: "output", label: "Digest" },
  { id: "radar-out", kind: "output", label: "Radar" },
  { id: "writing", kind: "output", label: "Writing" },
] as const;

export const GRAPH_EDGES: [string, string][] = [
  ["coldsearch", "agents"],
  ["coldsearch", "gov"],
  ["northstar", "gov"],
  ["northstar", "risk"],
  ["homelab", "agents"],
  ["agents", "digest"],
  ["gov", "radar-out"],
  ["risk", "writing"],
  ["coldsearch", "writing"],
];
