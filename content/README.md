# `content/` — git is the CMS

Markdown, YAML, and spike-scale JSON collections. The Next app (`apps/web`) reads them through `@content-collections/next`. Shared Zod + graph building belongs in `packages/schema`.

| Directory | Collection | Notes |
|---|---|---|
| `projects/` | projects | typed `topics`, `outputs`, `related` |
| `topics/` | topics | graph hubs |
| `concepts/` | concepts | vocabulary + optional `topic` |
| `outputs/` | outputs | papers, repos, external leaves |
| `digest/` | digest | newsletter issues + `transcript` |
| `links/inbox.yaml` | links | radar inbox (`items:`) |
| `cv/` | cv | timeline |
| `writing/` | writing | index (`on-site` → `post`, `external` → `url`) |
| `posts/` | posts | on-site essay bodies |
| `talks/` | talks | placeholders use `TODO:` |
| `art/` | art | visualization/deck workshop |
| `lab/` | lab | homelab, BEAST, Broadside |
| `library/explorers/` | library | spike-scale JSON maps |

Dangling references fail `npm run check` and the Next collection transform.
