# Personal notebook spike

Patrick MacLyman’s knowledge-graph site: git-backed collections, four live-switchable skins, agent MCP.

Collections, Zod contracts, and the build-time graph live in `content/` + `packages/schema`. MCP admin tools and radar/digest ingest live in `packages/mcp` and `packages/ingest`.

## Run

```bash
npm install
npm run check
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Press **D** for the Skin Dock.

```bash
npm run build
```

## Monorepo

- `apps/web` — Next.js 16 App Router, Tailwind v4, `motion`, `@content-collections/next`
- `content/` — git-as-CMS (seeded)
- `packages/schema` — Zod + graph + RRF (`npm run check`)
- `packages/mcp` — stdio MCP admin (`.cursor/mcp.json`)
- `packages/ingest` — RSS/URL → SQLite; silent `tts-render`
- `architecture/` — LikeC4-style model
- `AGENTS.md` — operator manual (radar convention, session-complete)

```bash
npm run mcp:check
npm run radar
bash scripts/digest/run.sh weekly --dry-run
```

pnpm is not required; npm workspaces are configured. `pnpm-workspace.yaml` is present if you switch later.
