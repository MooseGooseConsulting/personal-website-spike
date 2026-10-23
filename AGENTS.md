# Operator manual — Patrick MacLyman notebook

This is a **git-as-CMS** personal knowledge-graph site. Markdown and YAML in `content/` are the published source of truth. Agents never write the live site except by committing valid collection files.

This version of Next.js has breaking changes relative to older training data. Read `apps/web/node_modules/next/dist/docs/` (or the copy Next writes into `apps/web/AGENTS.md` on `next dev`) before changing App Router code.

## Layout

| Path | Role | Status |
|---|---|---|
| `apps/web` | Next.js 16 App Router + Tailwind v4 + motion + Skin Dock | scaffolded |
| `content/` | Markdown / YAML / JSON collections | **seeded** |
| `packages/schema` | Shared Zod + graph builder + RRF related-links | **live** |
| `packages/mcp` | Agent tools over stdio (+ optional HTTP) | **live** |
| `packages/ingest` | Radar RSS/URL → SQLite; silent `tts-render` | **live** |
| `architecture/` | LikeC4-style model (`notebook.c4`) | **live** |

Do not grow ad-hoc schemas inside `apps/web`. Import Zod contracts, graph builders, and integrity checks from `@notebook/schema` (thin re-export: `apps/web/lib/notebook.ts`).

## Git is the gate

1. Edit or generate files under `content/` (via MCP tools that validate first, or by hand).
2. Dangling graph edges must fail the build (`npm run check`).
3. Commit on `main` is how work ships. Push is the deploy signal.
4. Never mutate production HTML/JSON except through this path.

Session-complete protocol: `npm run check` → commit. Do not push unless asked.

No Beads. No Dolt.

## Radar convention

“Add this to radar” is an **agent instruction**, not a CMS UI.

That means: **fetch the URL**, then append a real note to `content/links/inbox.yaml` with MCP `add_radar_link`. Never invent the note from the slug or path. If the fetch fails, stop — do not fabricate a blurb.

Ingest (`npm run radar`) only fills `var/ingest.sqlite`. Promotion to the inbox still goes through a fetch + YAML write.

## Skins

`data-skin` on `<html>` + `localStorage` key `notebook-skin`. Skin Dock is persistent (keyboard `D`). Switching skins is a shared-layout animation. Every later page should be maximal **within the active skin** using tokens in `apps/web/app/globals.css` and motion presets in `apps/web/lib/skins.ts`.

1. Ink Voltage
2. Spatial Atlas
3. Foundry Glass
4. Print Disrupt

Do not copy sjarmak.com aesthetics or content.

## MCP

Wired in `.cursor/mcp.json` (stdio). Package: `@notebook/mcp`. Context7 checked: MCP TypeScript SDK (`McpServer.registerTool`, stdio + Streamable HTTP).

| Tool | Purpose |
|---|---|
| `list_graph` | Typed graph nodes/edges |
| `get_node` | One node (`project:coldsearch`) + related lanes |
| `add_radar_link` | Fetch URL, append inbox YAML |
| `upsert_project` | Write `content/projects/<slug>.md` |
| `upsert_output` | Write `content/outputs/<slug>.md` |
| `add_concept` | Write `content/concepts/<slug>.md` |
| `propose_digest` | Spec JSON under `var/digest/proposed/` |
| `publish_digest` | Validate spec, write `content/digest/<slug>.md` (transcript required) |
| `validate_site` | Schema + dangling-reference checks |
| `list_unresolved` | `TODO` fields, concepts missing `topic`, digest facets |

```bash
npm run mcp                 # stdio
npm run mcp:http            # http://127.0.0.1:3333/mcp  (debug POST /invoke)
npm run mcp:check           # dry run
npm run mcp:check -- --live-radar   # fetch example.com, revert inbox.yaml
```

Digest / radar:

```bash
npm run radar
bash scripts/digest/run.sh weekly --dry-run
npm run tts-render -- --all     # silent wav stubs; Kokoro skipped
```

`scripts/digest/run.sh` commits digest/radar paths when `COMMIT=1` (default) and **does not push** unless `PUSH=1`.

## Commands

```bash
npm install
npm run check    # schema + dangling edges + write graph/related JSON
npm run dev      # apps/web
npm run build    # check, then Next build
npm run mcp:check
```
