import { z } from "zod";
import {
  addConcept,
  addRadarLink,
  getNode,
  listGraph,
  listUnresolved,
  proposeDigest,
  publishDigest,
  upsertOutput,
  upsertProject,
  validateSite,
} from "./actions.ts";

export const TOOL_NAMES = [
  "list_graph",
  "get_node",
  "add_radar_link",
  "upsert_project",
  "upsert_output",
  "add_concept",
  "propose_digest",
  "publish_digest",
  "validate_site",
  "list_unresolved",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

const nodeType = z.enum([
  "project",
  "topic",
  "output",
  "concept",
  "post",
  "writing",
  "talk",
  "lab",
  "art",
  "digest",
  "cv",
]);

const radarKind = z.enum(["tool", "repo", "article", "paper", "video", "thread", "other"]);

export const toolSchemas = {
  list_graph: z.object({
    type: nodeType.optional(),
    limit: z.number().int().positive().optional(),
  }),
  get_node: z.object({
    id: z.string().optional().describe("Typed id such as project:coldsearch"),
    type: nodeType.optional(),
    slug: z.string().optional(),
  }),
  add_radar_link: z.object({
    url: z.string().url(),
    category: z.string().optional(),
    kind: radarKind.optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    title: z.string().optional().describe("Override only after a successful fetch"),
    note: z.string().optional().describe("Override only with text taken from the fetched page"),
    dryRun: z.boolean().optional(),
  }),
  upsert_project: z.object({
    slug: z.string(),
    title: z.string(),
    domain: z.enum(["research", "ai-agents", "tooling", "actuarial", "lab", "art", "consulting"]),
    summary: z.string(),
    body: z.string().optional(),
    status: z.enum(["active", "maintained", "archived", "concept"]).optional(),
    role: z.string().optional(),
    repo: z.string().optional(),
    homepage: z.string().optional(),
    visibility: z.enum(["public", "private-safe"]).optional(),
    tech: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    featuredOrder: z.number().optional(),
    topics: z.array(z.string()).optional(),
    outputs: z.array(z.string()).optional(),
    related: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    period: z.object({ start: z.string(), end: z.string().optional() }).optional(),
    force: z.boolean().optional(),
  }),
  upsert_output: z.object({
    slug: z.string(),
    title: z.string(),
    url: z.string(),
    kind: z.enum(["paper", "post", "talk", "repo", "digest", "external"]),
    summary: z.string().optional(),
    date: z.string().optional(),
    topics: z.array(z.string()).optional(),
    body: z.string().optional(),
    force: z.boolean().optional(),
  }),
  add_concept: z.object({
    slug: z.string(),
    label: z.string(),
    definition: z.string(),
    topic: z.string().optional(),
    aliases: z.array(z.string()).optional(),
    related: z.array(z.string()).optional(),
    body: z.string().optional(),
    force: z.boolean().optional(),
  }),
  propose_digest: z.object({
    slug: z.string(),
    title: z.string(),
    cadence: z.enum(["daily", "weekly", "monthly"]),
    date: z.string(),
    summary: z.string(),
    transcript: z.string(),
    body: z.string(),
    track: z.enum(["specialized", "general"]).optional(),
    origin: z.enum(["auto", "manual"]).optional(),
    topics: z.array(z.string()).optional(),
    unresolvedFacets: z.array(z.string()).optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          url: z.string(),
          source: z.string().optional(),
          category: z.string().optional(),
        }),
      )
      .optional(),
    highlights: z.array(z.string()).optional(),
    audioUrl: z.string().optional(),
    durationSec: z.number().int().optional(),
    allowRepeat: z.boolean().optional(),
  }),
  publish_digest: z.object({
    slug: z.string().optional(),
    specPath: z.string().optional(),
    allowRepeat: z.boolean().optional(),
    writeAudioStub: z.boolean().optional(),
    force: z.boolean().optional(),
  }),
  validate_site: z.object({}),
  list_unresolved: z.object({}),
} as const;

export const toolDescriptions: Record<ToolName, string> = {
  list_graph: "List notebook graph nodes and edges (typed projects/topics/outputs/...).",
  get_node: "Get one graph node by typed id (project:slug) plus related-link lanes.",
  add_radar_link:
    "Fetch a URL and append it to content/links/inbox.yaml. Never invent the note from the slug; fetch first.",
  upsert_project: "Write content/projects/<slug>.md after Zod + dangling-ref checks.",
  upsert_output: "Write content/outputs/<slug>.md after Zod + dangling-ref checks.",
  add_concept: "Write content/concepts/<slug>.md after Zod + dangling-ref checks.",
  propose_digest: "Write a digest spec JSON under var/digest/proposed/. Transcript required. Repeat-guard on item URLs.",
  publish_digest: "Validate a proposed spec and write content/digest/<slug>.md. Transcript always; audio stub optional.",
  validate_site: "Load the corpus and run schema + dangling-reference checks (same gate as npm run check).",
  list_unresolved: "Concept-gate leftovers: frontmatter TODO fields, concepts missing topic, digest unresolvedFacets.",
};

export async function executeTool(name: string, args: unknown): Promise<unknown> {
  switch (name) {
    case "list_graph":
      return listGraph(toolSchemas.list_graph.parse(args ?? {}));
    case "get_node":
      return getNode(toolSchemas.get_node.parse(args ?? {}));
    case "add_radar_link":
      return addRadarLink(toolSchemas.add_radar_link.parse(args ?? {}));
    case "upsert_project":
      return upsertProject(toolSchemas.upsert_project.parse(args ?? {}));
    case "upsert_output":
      return upsertOutput(toolSchemas.upsert_output.parse(args ?? {}));
    case "add_concept":
      return addConcept(toolSchemas.add_concept.parse(args ?? {}));
    case "propose_digest":
      return proposeDigest(args);
    case "publish_digest":
      return publishDigest(toolSchemas.publish_digest.parse(args ?? {}));
    case "validate_site":
      return validateSite();
    case "list_unresolved":
      return listUnresolved();
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export function jsonToolResult(data: unknown): { content: { type: "text"; text: string }[] } {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

export function errorToolResult(error: unknown): {
  content: { type: "text"; text: string }[];
  isError: true;
} {
  const message = error instanceof Error ? error.message : String(error);
  return { content: [{ type: "text", text: message }], isError: true };
}
