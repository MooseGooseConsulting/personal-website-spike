---
title: Harnesses that sit outside the model
cadence: weekly
track: specialized
origin: manual
date: 2026-08-31
summary: Sample digest — CLI retrieval, North Star policy on the PR, and why swarm planners need a judge.
topics:
  - agent-harnesses
  - multi-agent-systems
  - llm-governance
audioUrl: /audio/digest/2026-08-31-harnesses.stub.wav
durationSec: 0
items:
  - title: ColdSearch
    url: https://github.com/MooseGooseConsulting/ColdSearch
    source: GitHub
    category: repo
  - title: NorthStarGuardian
    url: https://github.com/MooseGooseConsulting/NorthStarGuardian
    source: GitHub
    category: repo
  - title: Agent swarms and the new model economics
    url: https://cursor.com/blog/agent-swarm-model-economics
    source: Cursor
    category: article
highlights:
  - CLI-first retrieval beats a tool dump into the window
  - A North Star on main is model risk for repos
  - Split-brain planners are a harness problem, not a prompting hobby
transcript: |
  Sample transcript (audio is a silent stub). Harnesses that sit outside the model
  curate context before the agent asks. ColdSearch is the retrieval surface.
  NorthStarGuardian interviews the diff against a committed identity. Cursor's
  swarm writeup names split-brain planners; a judge with the project goals is
  one way to break the tie without mutually exclusive scopes.
---

## This week

Three public artifacts, one argument: the model should not be the registrar of its own rules.

**ColdSearch** is a unified CLI over overlapping search/extract/crawl providers. The routing lives in config, not in a prompt that has to remember which vendor hates which flag.

**NorthStarGuardian** reads the North Star from the base branch so a PR cannot review itself against a rewritten constitution.

**Cursor's swarm economics post** (1,000 commits/second, split-brain planners, contention) is the industrial version of a problem I have been hitting in smaller multi-agent repos: overlapping domains are where the work is, and a judge with the goals is cheaper than pretending scopes never overlap.

Audio is stubbed. Transcript is the source of truth until TTS exists.

## Transcript

See frontmatter `transcript` for the spike-scale reading copy.
