import { defineCollection, defineConfig } from "@content-collections/core";
import {
  artSchema,
  assertSlugRefs,
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
} from "@notebook/schema";

const CONTENT = "../../content";

type MetaDoc = { _meta: { path: string } };

function slugs(docs: MetaDoc[]): string[] {
  return docs.map((doc) => doc._meta.path);
}

const topics = defineCollection({
  name: "topics",
  directory: `${CONTENT}/topics`,
  include: "**/*.md",
  schema: topicSchema,
  transform: async (doc, context) => {
    const siblings = await context.collection.documents();
    assertSlugRefs("topics", doc._meta.path, "related", doc.related, slugs(siblings), "topics");
    return { ...doc, slug: doc._meta.path };
  },
});

const outputs = defineCollection({
  name: "outputs",
  directory: `${CONTENT}/outputs`,
  include: "**/*.md",
  schema: outputSchema,
  transform: async (doc, context) => {
    const topicDocs = await context.documents(topics);
    assertSlugRefs("outputs", doc._meta.path, "topics", doc.topics, slugs(topicDocs), "topics");
    return { ...doc, slug: doc._meta.path };
  },
});

const projects = defineCollection({
  name: "projects",
  directory: `${CONTENT}/projects`,
  include: "**/*.md",
  schema: projectSchema,
  transform: async (doc, context) => {
    const [topicDocs, outputDocs, projectDocs] = await Promise.all([
      context.documents(topics),
      context.documents(outputs),
      context.collection.documents(),
    ]);
    assertSlugRefs("projects", doc._meta.path, "topics", doc.topics, slugs(topicDocs), "topics");
    assertSlugRefs("projects", doc._meta.path, "outputs", doc.outputs, slugs(outputDocs), "outputs");
    assertSlugRefs(
      "projects",
      doc._meta.path,
      "related",
      doc.related,
      slugs(projectDocs),
      "projects",
    );
    return { ...doc, slug: doc._meta.path };
  },
});

const concepts = defineCollection({
  name: "concepts",
  directory: `${CONTENT}/concepts`,
  include: "**/*.md",
  schema: conceptSchema,
  transform: async (doc, context) => {
    const [topicDocs, conceptDocs] = await Promise.all([
      context.documents(topics),
      context.collection.documents(),
    ]);
    if (doc.topic) {
      assertSlugRefs("concepts", doc._meta.path, "topic", [doc.topic], slugs(topicDocs), "topics");
    }
    assertSlugRefs(
      "concepts",
      doc._meta.path,
      "related",
      doc.related,
      slugs(conceptDocs),
      "concepts",
    );
    return { ...doc, slug: doc._meta.path };
  },
});

const posts = defineCollection({
  name: "posts",
  directory: `${CONTENT}/posts`,
  include: "**/*.md",
  schema: postSchema,
  transform: async (doc, context) => {
    const topicDocs = await context.documents(topics);
    assertSlugRefs("posts", doc._meta.path, "topics", doc.topics, slugs(topicDocs), "topics");
    return { ...doc, slug: doc._meta.path };
  },
});

const writing = defineCollection({
  name: "writing",
  directory: `${CONTENT}/writing`,
  include: "**/*.md",
  schema: writingSchema,
  transform: async (doc, context) => {
    const [topicDocs, postDocs] = await Promise.all([
      context.documents(topics),
      context.documents(posts),
    ]);
    assertSlugRefs("writing", doc._meta.path, "topics", doc.topics, slugs(topicDocs), "topics");
    if (doc.post) {
      assertSlugRefs("writing", doc._meta.path, "post", [doc.post], slugs(postDocs), "posts");
    }
    return { ...doc, slug: doc._meta.path };
  },
});

const talks = defineCollection({
  name: "talks",
  directory: `${CONTENT}/talks`,
  include: "**/*.md",
  schema: talkSchema,
  transform: async (doc, context) => {
    const topicDocs = await context.documents(topics);
    assertSlugRefs("talks", doc._meta.path, "topics", doc.topics, slugs(topicDocs), "topics");
    return { ...doc, slug: doc._meta.path };
  },
});

const art = defineCollection({
  name: "art",
  directory: `${CONTENT}/art`,
  include: "**/*.md",
  schema: artSchema,
  transform: async (doc, context) => {
    const topicDocs = await context.documents(topics);
    assertSlugRefs("art", doc._meta.path, "topics", doc.topics, slugs(topicDocs), "topics");
    return { ...doc, slug: doc._meta.path };
  },
});

const lab = defineCollection({
  name: "lab",
  directory: `${CONTENT}/lab`,
  include: "**/*.md",
  schema: labSchema,
  transform: async (doc, context) => {
    const [topicDocs, labDocs] = await Promise.all([
      context.documents(topics),
      context.collection.documents(),
    ]);
    assertSlugRefs("lab", doc._meta.path, "topics", doc.topics, slugs(topicDocs), "topics");
    assertSlugRefs("lab", doc._meta.path, "related", doc.related, slugs(labDocs), "lab");
    return { ...doc, slug: doc._meta.path };
  },
});

const cv = defineCollection({
  name: "cv",
  directory: `${CONTENT}/cv`,
  include: "**/*.md",
  schema: cvSchema,
  transform: async (doc, context) => {
    const topicDocs = await context.documents(topics);
    assertSlugRefs("cv", doc._meta.path, "topics", doc.topics, slugs(topicDocs), "topics");
    return { ...doc, slug: doc._meta.path };
  },
});

const digest = defineCollection({
  name: "digest",
  directory: `${CONTENT}/digest`,
  include: "*.md",
  schema: digestSchema,
  transform: async (doc, context) => {
    const topicDocs = await context.documents(topics);
    assertSlugRefs("digest", doc._meta.path, "topics", doc.topics, slugs(topicDocs), "topics");
    return { ...doc, slug: doc._meta.path };
  },
});

const links = defineCollection({
  name: "links",
  directory: `${CONTENT}/links`,
  include: "inbox.yaml",
  parser: "yaml",
  schema: radarInboxSchema,
  transform: (doc) => ({
    ...doc,
    slug: "inbox",
  }),
});

const library = defineCollection({
  name: "library",
  directory: `${CONTENT}/library/explorers`,
  include: "*.json",
  parser: "json",
  schema: explorerMapSchema,
  transform: async (doc, context) => {
    const topicDocs = await context.documents(topics);
    assertSlugRefs("library", doc.id, "topic", [doc.topic], slugs(topicDocs), "topics");
    const nodeIds = new Set(doc.nodes.map((node) => node.id));
    for (const edge of doc.edges) {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        throw new Error(
          `Dangling edge: library/${doc.id} edges -> library-node:${edge.source}->${edge.target}`,
        );
      }
    }
    return { ...doc, slug: doc.id };
  },
});

export default defineConfig({
  content: [
    topics,
    outputs,
    projects,
    concepts,
    posts,
    writing,
    talks,
    art,
    lab,
    cv,
    digest,
    links,
    library,
  ],
});
