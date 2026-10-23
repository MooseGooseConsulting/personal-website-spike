import { z } from "zod";

/** YAML/frontmatter may yield Date objects or ISO strings. */
export const dateish = z
  .union([z.date(), z.string(), z.number()])
  .transform((value, ctx) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: "custom", message: "invalid date" });
      return z.NEVER;
    }
    return date;
  });

export const href = z.union([
  z.string().url(),
  z.string().regex(/^\/[^\s]*$/, "expected URL or site-relative path"),
]);

export const labeledLinkSchema = z.object({
  label: z.string(),
  url: href,
});

export const dateRangeSchema = z.object({
  start: dateish,
  end: dateish.optional(),
});

const slugList = z.array(z.string()).default([]);

/** Gaps later agents should fill. Literal `TODO:` key in frontmatter. */
const todoField = {
  TODO: z.string().optional(),
};

export const projectSchema = z.object({
  title: z.string(),
  status: z.enum(["active", "maintained", "archived", "concept"]).default("active"),
  domain: z.enum([
    "research",
    "ai-agents",
    "tooling",
    "actuarial",
    "lab",
    "art",
    "consulting",
  ]),
  summary: z.string(),
  role: z.string().optional(),
  period: dateRangeSchema.optional(),
  repo: href.optional(),
  homepage: href.optional(),
  visibility: z.enum(["public", "private-safe"]).default("public"),
  links: z.array(labeledLinkSchema).default([]),
  tech: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  featuredOrder: z.number().optional(),
  topics: slugList,
  outputs: slugList,
  related: slugList,
  tags: z.array(z.string()).default([]),
  order: z.number().optional(),
  content: z.string().default(""),
  ...todoField,
});

export const topicSchema = z.object({
  title: z.string(),
  summary: z.string(),
  related: slugList,
  weight: z.number().default(1),
  content: z.string().default(""),
  ...todoField,
});

export const conceptSchema = z.object({
  label: z.string(),
  aliases: z.array(z.string()).default([]),
  definition: z.string(),
  topic: z.string().optional(),
  related: slugList,
  content: z.string().default(""),
  ...todoField,
});

export const outputSchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  kind: z.enum(["paper", "post", "talk", "repo", "digest", "external"]),
  date: dateish.optional(),
  url: href,
  topics: slugList,
  content: z.string().default(""),
  ...todoField,
});

export const writingSchema = z
  .object({
    title: z.string(),
    date: dateish.optional(),
    source: z.enum(["on-site", "external"]),
    kind: z.enum(["essay", "technical-report"]).default("essay"),
    url: href.optional(),
    post: z.string().optional(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    topics: slugList,
    featured: z.boolean().default(false),
    content: z.string().default(""),
    ...todoField,
  })
  .refine(
    (doc) =>
      doc.source === "on-site"
        ? Boolean(doc.post) && !doc.url
        : Boolean(doc.url) && !doc.post,
    {
      message: "on-site writing needs `post`; external writing needs `url`.",
    },
  );

export const postSchema = z.object({
  title: z.string(),
  date: dateish,
  updated: dateish.optional(),
  description: z.string(),
  subtitle: z.string().optional(),
  draft: z.boolean().default(false),
  unlisted: z.boolean().default(false),
  kind: z.enum(["essay", "technical-report"]).default("essay"),
  tags: z.array(z.string()).default([]),
  topics: slugList,
  content: z.string().default(""),
  ...todoField,
});

export const talkSchema = z.object({
  title: z.string(),
  event: z.string(),
  eventUrl: href.optional(),
  location: z.string().optional(),
  date: dateish,
  kind: z.enum(["webinar", "conference", "panel", "invited", "podcast", "demo"]),
  videoUrl: href.optional(),
  slidesUrl: href.optional(),
  links: z.array(labeledLinkSchema).default([]),
  description: z.string().optional(),
  featured: z.boolean().default(false),
  topics: slugList,
  content: z.string().default(""),
  ...todoField,
});

export const artSchema = z.object({
  title: z.string(),
  medium: z.enum(["visualization", "deck", "illustration", "mixed"]),
  section: z.string().default("Other"),
  year: z.number().int().optional(),
  description: z.string().optional(),
  links: z.array(labeledLinkSchema).default([]),
  featured: z.boolean().default(false),
  order: z.number().optional(),
  topics: slugList,
  content: z.string().default(""),
  ...todoField,
});

export const labSchema = z.object({
  title: z.string(),
  status: z.enum(["active", "maintained", "archived", "concept"]).default("active"),
  summary: z.string(),
  kind: z.enum(["homelab", "robotics", "simulation", "workshop"]).default("homelab"),
  links: z.array(labeledLinkSchema).default([]),
  topics: slugList,
  related: slugList,
  featured: z.boolean().default(false),
  content: z.string().default(""),
  ...todoField,
});

export const cvSchema = z.object({
  title: z.string(),
  org: z.string(),
  location: z.string().optional(),
  category: z.enum(["work", "education", "affiliation", "award", "service"]),
  range: dateRangeSchema,
  current: z.boolean().default(false),
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  links: z.array(labeledLinkSchema).default([]),
  tags: z.array(z.string()).default([]),
  topics: slugList,
  order: z.number().optional(),
  content: z.string().default(""),
  ...todoField,
});

export const digestItemSchema = z.object({
  title: z.string(),
  url: href,
  source: z.string().optional(),
  category: z.string().optional(),
});

export const digestSchema = z.object({
  title: z.string(),
  cadence: z.enum(["daily", "weekly", "monthly"]),
  track: z.enum(["specialized", "general"]).default("specialized"),
  origin: z.enum(["auto", "manual"]).default("auto"),
  date: dateish,
  summary: z.string(),
  topics: z.array(z.string()).default([]),
  unresolvedFacets: z.array(z.string()).optional(),
  audioUrl: z.string().optional(),
  embedUrl: href.optional(),
  durationSec: z.number().int().optional(),
  items: z.array(digestItemSchema).default([]),
  highlights: z.array(z.string()).default([]),
  transcript: z.string().optional(),
  content: z.string().default(""),
  ...todoField,
});

export const radarKindSchema = z.enum([
  "tool",
  "repo",
  "article",
  "paper",
  "video",
  "thread",
  "other",
]);

export const radarItemSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  category: z.string(),
  kind: radarKindSchema.default("other"),
  note: z.string().optional(),
  tags: z.array(z.string()).default([]),
  added: dateish,
  featured: z.boolean().default(false),
});

export const radarInboxSchema = z.object({
  items: z.array(radarItemSchema),
});

export const explorerNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  url: href.optional(),
  year: z.number().int().optional(),
  kind: z.enum(["paper", "post", "repo", "note", "talk", "standard"]).default("note"),
});

export const explorerMapSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  topic: z.string(),
  nodes: z.array(explorerNodeSchema),
  edges: z
    .array(
      z.object({
        source: z.string(),
        target: z.string(),
        note: z.string().optional(),
      }),
    )
    .default([]),
});

export const COLLECTION_NAMES = [
  "projects",
  "topics",
  "concepts",
  "outputs",
  "digest",
  "links",
  "cv",
  "writing",
  "posts",
  "talks",
  "art",
  "lab",
  "library",
] as const;

export type CollectionName = (typeof COLLECTION_NAMES)[number];

export type ProjectDoc = z.infer<typeof projectSchema>;
export type TopicDoc = z.infer<typeof topicSchema>;
export type ConceptDoc = z.infer<typeof conceptSchema>;
export type OutputDoc = z.infer<typeof outputSchema>;
export type WritingDoc = z.infer<typeof writingSchema>;
export type PostDoc = z.infer<typeof postSchema>;
export type TalkDoc = z.infer<typeof talkSchema>;
export type ArtDoc = z.infer<typeof artSchema>;
export type LabDoc = z.infer<typeof labSchema>;
export type CvDoc = z.infer<typeof cvSchema>;
export type DigestDoc = z.infer<typeof digestSchema>;
export type RadarItem = z.infer<typeof radarItemSchema>;
export type RadarInbox = z.infer<typeof radarInboxSchema>;
export type ExplorerMap = z.infer<typeof explorerMapSchema>;
