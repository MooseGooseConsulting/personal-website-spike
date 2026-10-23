---
title: NorthStarGuardian
status: active
domain: ai-agents
summary: Advisory GitHub Action that interviews a pull request against the repo North Star. The PR cannot rewrite the rules it is measured by.
role: Author
period:
  start: 2025-01-01
repo: https://github.com/MooseGooseConsulting/NorthStarGuardian
visibility: public
tech:
  - Python
  - GitHub Actions
  - OpenAI
featured: true
featuredOrder: 2
topics:
  - llm-governance
  - agent-harnesses
  - multi-agent-systems
outputs:
  - northstar-guardian-action
tags:
  - governance
  - github-actions
---

Pre-alpha. Reads `docs/northstar.md` from the base branch (or a Linear document), posts a structured interview on the PR, and writes Guardian memory under `.github/guardian/`. Chronograph is the configuration steward: allowlisted, reversible, audited. Public repo, 0 stars at seed time.
