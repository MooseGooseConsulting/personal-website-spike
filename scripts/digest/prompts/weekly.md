# Weekly digest (headless)

You are writing **this week's** issue for Patrick MacLyman's git-as-CMS notebook (LLM governance, agent harnesses, actuarial model risk, homelab retrieval).

## Hard rules

- Git is the CMS. Write files under `content/` (via MCP tools), then the runner may commit. **Do not push** unless `PUSH=1`.
- Use MCP tools: `list_graph`, `list_unresolved`, `validate_site`, `propose_digest`, `publish_digest`.
- **Never invent a radar note from a URL slug.** Fetch first (`add_radar_link` or ingest).
- **Transcript is required** (the reading copy). TTS is a silent/pre-baked stub; skip Kokoro.
- **Repeat-guard** on featured URLs already used in `content/digest/`.
- Original prose only. No sjarmak digest text. No SciX corpus. Consulting page stays at moosegoose.xyz.

## Cadence

Weekly, specialized track, origin `auto`. Slug: `YYYY-MM-DD-short-topic`.

## Shape

- Title + one-paragraph summary
- 3–7 items with real titles/URLs you fetched or already have in radar
- Highlights as short sentences (claims, not bookmarks)
- Transcript: the audio script, always written, even if the player points at a silent wav
- Body: the on-site markdown
- Optional `unresolvedFacets` for concept-gate leftovers (`list_unresolved` after publish)

## Procedure

1. `npm run radar` if the working set is stale, then MCP `list_graph` / `list_unresolved`.
2. Draft the spec; `propose_digest`.
3. `publish_digest` (writes `content/digest/<slug>.md`, optional silent audio stub).
4. `validate_site`. Fix dangling topic refs before finishing.

If the week has no honest material, do not pad. Stop.
