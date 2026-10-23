# `@notebook/schema`

Shared Zod collection contracts, build-time knowledge graph, and three-lane RRF related-links.

Later agents (section pages, MCP write validation) should import from here — not grow schemas inside `apps/web`.

## Imports

```ts
import {
  projectSchema,
  topicSchema,
  buildNotebook,
  loadCorpus,
  assertCorpusIntegrity,
  rrf,
} from "@notebook/schema";

import type { GraphData, RelatedMap } from "@notebook/schema";
import graph from "@notebook/schema/graph.json";
import related from "@notebook/schema/related.json";
```

Next app thin re-export: `apps/web/lib/notebook.ts`.

Content Collections wiring: `apps/web/content-collections.ts` (schemas + dangling-ref transforms). Generated exports:

`allProjects`, `allTopics`, `allConcepts`, `allOutputs`, `allWritings`, `allPosts`, `allTalks`, `allArts`, `allLabs`, `allCvs`, `allDigests`, `allLinks`, `allLibraries` from `"content-collections"`.

Generated at `npm run check`:

- `packages/schema/generated/graph.json` — `{ nodes, edges }`
- `packages/schema/generated/related.json` — per-node lexical / semantic-stub / graph / fused lists
