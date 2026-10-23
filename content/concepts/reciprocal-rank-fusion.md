---
label: Reciprocal rank fusion
aliases:
  - RRF
  - rrf-fuse
definition: A rank-level fusion that scores an item as the sum of 1 / (k + rank) across retrieval lanes. No score calibration required; lexical, graph, and a stub embedding lane can share a list.
topic: agent-harnesses
related:
  - typed-graph
---

Used here at build time over the seeded node set. k = 60, same family as the Cormack SIGIR note.
