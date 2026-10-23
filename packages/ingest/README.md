# `@notebook/ingest`

Spike-scale ingest. **SQLite is a working set**, not the published site. Publish still means “write markdown + git commit” after `@notebook/schema` validation.

## Radar

Feeds: `packages/ingest/feeds.yaml` (arxiv cs.AI + stat.ML). Optional single URL.

```bash
npm run radar                    # RSS → var/ingest.sqlite
npm run radar -- --url https://example.com/ --category Inbox
npm run list -w @notebook/ingest
node --experimental-strip-types scripts/radar/ingest.ts
```

Candidates stay in SQLite until an agent promotes them with MCP `add_radar_link` (which **fetches** the URL and appends `content/links/inbox.yaml`).

## Digest helpers

- Repeat-guard: URLs already in `content/digest/` item lists
- `tts-render`: always expect a transcript on the issue; write a **silent wav** the player can point at. **Kokoro is skipped.**

```bash
npm run tts-render -w @notebook/ingest -- --slug 2026-08-31-harnesses
npm run tts-render -w @notebook/ingest -- --all
node --experimental-strip-types scripts/digest/tts-render.ts --all
bash scripts/digest/run.sh weekly --dry-run
```

`scripts/digest/run.sh` writes a dated prompt under `var/digest/`, optionally runs radar, optionally invokes `claude`/`agent` if present, commits digest/radar paths when `COMMIT=1` (default), **never pushes** unless `PUSH=1`.

## Leftover TODOs

- Production TTS (Kokoro or other) — spike writes transcript + silent wav only
- Render/CI polish and a second auth-gated curator app (hook only; skipped)
- SciX-scale paper engine — out of scope
- Expanding RSS feeds beyond the two arXiv channels
- Filling seeded `TODO:` gaps in talks/art/lab/projects (content, not backend)
- Production TTS (Kokoro or other) — spike writes transcript + silent wav only; sample issues now point `audioUrl` at `.stub.wav`
- Beads/Dolt — explicitly not in this spike

