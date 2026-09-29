# Agent delivery diagrams

Editable Archify inputs live here. The generated standalone HTML files are
served from `public/diagrams/` and linked from `/lab/agent-delivery`. Keep the
JSON and HTML together when revising a diagram; editing generated HTML by hand
will be lost on regeneration.

| Diagram | Status | Evidence basis |
| --- | --- | --- |
| `distribution.json` | Source-backed architecture | Oh My OpenAgent commit `79ab21eb774b8956ae46e593fafa05a8f11f7aa8` |
| `ship-boundary.json` | Source-backed workflow | LazyCodex commit `6cf104ed1c8afac13a483f35acc2daf6aef49372` |
| `repair-batch.json` | Proposed workflow | Evaluation idea, **not** implemented upstream behavior |

These files were transferred from the private `frozenskills-codex-delivery-map`
companion site. They were generated with [Archify](https://github.com/tt-a1i/archify)
3.0.1 at commit `5ca9c1233b82fac6478158cc1ee2d00c42d3ab1b`. That run
passed Archify's showcase, delivery, artifact, and real-browser checks; it did
not include separate perceptual review. The generated HTML is self-contained
and does not require Archify at site runtime.

To revise one, use Archify's `finalize` command with the corresponding JSON as
input and `public/diagrams/<name>.html` as output. For source-backed diagrams,
point `--repo-root` at a clean checkout of the pinned source commit. Review the
rendered result and update this evidence note when the source basis changes.
