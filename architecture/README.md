# architecture/

Content → schema → build → git → MCP/cron. The live site never moves except through a valid commit on `main`.

See `notebook.c4` for the LikeC4-style model (elements + one context view). You do not need the LikeC4 CLI for the spike; the file is documentation.

```text
author/agent ──MCP/cron──► content/ ──@notebook/schema──► graph.json
                                │                              │
                                └── git commit (gate)          └── apps/web build
                                         │
                                         └── push (deploy signal)
```

| Piece | Path | Role |
|---|---|---|
| Collections | `content/` | Markdown, YAML inbox, spike-scale JSON explorers |
| Contracts | `packages/schema` | Zod, `loadCorpus`, `buildNotebook`, dangling-ref fail |
| Site | `apps/web` | Next.js 16, skins, motion — reads generated graph |
| Admin | `packages/mcp` | stdio MCP (+ optional HTTP) write tools |
| Working set | `packages/ingest` | RSS/URL → SQLite; silent `tts-render` |
| Cron | `scripts/digest/run.sh` | Prompt + optional headless agent; commit; push off |

## Leftover TODOs

- Production TTS (Kokoro skipped; silent `.stub.wav` only)
- Render/CI polish; auth-gated curator app (mention the hook, skip the app)
- Broader RSS set; SciX-scale library (out of scope)
- Seeded `TODO:` gaps in talks / art / lab / private-safe project blurbs
- Beads / Dolt — not in this spike

