# `@notebook/mcp`

Stdio MCP admin server (`@modelcontextprotocol/sdk` v1.30) for the git-as-CMS notebook. Optional HTTP: `--http` (Streamable HTTP at `/mcp`, debug `POST /invoke`).

Context7 checked: MCP TypeScript SDK (`McpServer.registerTool`, `StdioServerTransport`, `StreamableHTTPServerTransport`).

## Tools

| Tool | Writes | Notes |
|---|---|---|
| `list_graph` | no | Nodes/edges; optional `type`, `limit` |
| `get_node` | no | `id` like `project:coldsearch` |
| `add_radar_link` | `content/links/inbox.yaml` | **Fetches the URL.** Never invent the note from the slug. `dryRun` supported |
| `upsert_project` | `content/projects/<slug>.md` | Zod + dangling-ref check |
| `upsert_output` | `content/outputs/<slug>.md` | Zod + dangling-ref check |
| `add_concept` | `content/concepts/<slug>.md` | Fails if slug exists unless `force` |
| `propose_digest` | `var/digest/proposed/<slug>.json` | Transcript required; repeat-guard on item URLs |
| `publish_digest` | `content/digest/<slug>.md` | Validates spec; optional silent audio stub |
| `validate_site` | no | Same integrity gate as `npm run check` (does not rewrite `graph.json`) |
| `list_unresolved` | no | Frontmatter `TODO`, concepts missing `topic`, digest `unresolvedFacets` |

Cursor wiring: `.cursor/mcp.json`. Operator manual: root `AGENTS.md`.

## Run

```bash
npm run mcp                 # stdio (what Cursor spawns)
npm run mcp:http            # http://127.0.0.1:3333/mcp
npm run mcp:check           # validate_site + dry-run add_radar_link
npm run mcp:check -- --live-radar   # fetch example.com, append, revert inbox.yaml
```

Do not log on stdout in stdio mode (JSON-RPC only). Use stderr.

Session-complete: `validate_site` / `npm run check` → commit. Do not push unless asked.
