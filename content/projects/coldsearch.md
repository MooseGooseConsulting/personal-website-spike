---
title: ColdSearch
status: active
domain: tooling
summary: Unified search CLI over overlapping provider APIs — search, extract, crawl — with config-driven routing. CLI-first; MCP is not the long-term interface.
role: Author
period:
  start: 2025-01-01
repo: https://github.com/MooseGooseConsulting/ColdSearch
visibility: public
tech:
  - TypeScript
  - Tavily
  - Exa
  - SearXNG
featured: true
featuredOrder: 1
topics:
  - agent-harnesses
  - llm-governance
  - homelab
outputs:
  - coldsearch-cli
tags:
  - retrieval
  - cli
---

`coldsearch` hides provider-specific quirks behind shared schemas. Routing and key management live in config (`~/.config/coldsearch/config.toml`). Implemented capabilities: search (SearXNG, Tavily, Exa, Brave, Serper), extract (Tavily, Exa, Jina, Firecrawl), crawl (Tavily, Firecrawl, Exa). Batch runs are resumable JSONL. Public repo, 1 star at seed time.
