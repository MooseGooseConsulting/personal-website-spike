# Personal notebook spike

Patrick MacLyman’s knowledge-graph site spike: git-backed collections, agent MCP, and a motion lab.

This first slice is the **notebook context engine** animation at `/lab/context-engine`. It is scoped to *this* pipeline (radar inbox → SQLite working set → MCP writes → typed graph → RRF related-links → git gate), not a generic Context Engine product demo.

The original Codex HTML lived on another machine (`file:///C:/Users/pmacl/Documents/Codex/2026-09-04/can-x20/outputs/context-engine-animation.html`) and was not readable from this workspace, so the Lab piece was rebuilt around the spike architecture.

```bash
npm install
npm run dev
```

Open [http://localhost:3000/lab/context-engine](http://localhost:3000/lab/context-engine).

Context7 checked: Next.js App Router / create-next-app; Motion `MotionConfig reducedMotion="user"`.
