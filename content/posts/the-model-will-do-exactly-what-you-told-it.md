---
title: The model will do exactly what you told it
date: 2026-09-04
description: Why this notebook is a typed graph in git, not another CMS, and why that is an actuarial habit rather than a web one.
subtitle: Git is the review gate. Dangling edges fail the build.
kind: essay
tags:
  - governance
  - git
  - agents
topics:
  - llm-governance
  - agent-harnesses
  - actuarial-systems
---

Ted Nelson already wrote the warning I now give clients: computers do what you tell them to do, which is also the bad news. A large language model is not an exception. It is the same machine with better manners.

I spent a decade at Oliver Wyman’s actuarial practice on models that were allowed to move money. AXIS, Prophet, ARCVAL, LTC combo products, reserve financing, buy-side diligence. The useful skill was never the syntax. It was refusing to touch the how until someone could say what decision the model was for. Combination products and multi-year embeds were interesting because they did not have a playbook. Assumptions mattered more than the engine.

That is the same job as steering an LLM. Companies rush the technology because the demo is cheap. They cannot enumerate the work. The model will not enumerate it for them. It will do exactly what the prompt, the tools, and the missing review implied.

MooseGoose Consulting stays at [moosegoose.xyz](https://moosegoose.xyz/). This site is the notebook: git as CMS, Markdown as the published source of truth, typed edges between projects, topics, and outputs. An agent may append a radar link after it fetches the URL. It may not invent the note. A slug that does not resolve fails `npm run check`.

I would rather build the graph than present a deck about building the graph. The harness belongs outside the model — hooks, allowlists, a North Star the PR cannot rewrite for itself. ColdSearch is retrieval with the CLI as the operator surface. NorthStarGuardian is policy next to the diff. Reciprocal rank fusion at build time is a small version of the same idea: several lanes, no faith in a single score.

If this reads like model risk, that is because it is.
