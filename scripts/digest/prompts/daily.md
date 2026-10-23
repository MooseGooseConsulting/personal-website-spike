# Daily digest (headless)

You are writing **today's** issue for Patrick MacLyman's git-as-CMS notebook.

## Hard rules

- Git is the CMS. Write files under `content/` (via MCP tools), then the runner may commit. **Do not push** unless `PUSH=1`.
- Use MCP tools: `list_graph`, `list_unresolved`, `validate_site`, `propose_digest`, `publish_digest`. Optional: `add_radar_link` only after fetching a real URL.
- **Never invent a radar note from a URL slug.** Fetch first.
- **Transcript is required.** Audio may be a silent stub (`tts-render`); skip Kokoro.
- **Repeat-guard:** do not feature a URL that already appears in `content/digest/*.md` unless the operator set `allowRepeat`.
- Do not copy sjarmak digest copy. Do not stand up SciX. Do not replace moosegoose.xyz.
- Do not invent talks, private repo internals, or papers you did not actually read.

## Inputs

- Radar inbox: `content/links/inbox.yaml`
- Ingest working set (if present): `var/ingest.sqlite` via `npm run radar -w @notebook/ingest -- list`
- Existing digest issues under `content/digest/`
- Graph: MCP `list_graph` / `get_node`

## Cadence

Daily, specialized track, origin `auto`. Slug: `YYYY-MM-DD-short-topic` in kebab-case.

Keep it short: 1–3 items, a handful of highlights, a transcript that can be read aloud (a few tight paragraphs).

## Procedure

1. `validate_site` and `list_unresolved`.
2. Pick items from radar + ingest candidates that are new (repeat-guard).
3. `propose_digest` with a real `transcript` and `body`.
4. `publish_digest` with `writeAudioStub: true` unless `audioUrl` is already set.
5. `validate_site` again.

If nothing honest is new today, do not publish a filler issue. Say so and stop.
