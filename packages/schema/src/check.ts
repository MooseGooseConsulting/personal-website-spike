import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildNotebook } from "./graph.ts";
import { collectIntegrityErrors, formatIntegrityErrors } from "./integrity.ts";
import { loadCorpus } from "./load.ts";

const here = dirname(fileURLToPath(import.meta.url));
const generatedDir = join(here, "..", "generated");

function main(): void {
  const corpus = loadCorpus();
  const errors = collectIntegrityErrors(corpus);
  if (errors.length > 0) {
    console.error(formatIntegrityErrors(errors));
    process.exit(1);
  }

  const { graph, related, stats } = buildNotebook(corpus);
  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(join(generatedDir, "graph.json"), `${JSON.stringify(graph, null, 2)}\n`);
  writeFileSync(join(generatedDir, "related.json"), `${JSON.stringify(related, null, 2)}\n`);

  const counts = {
    projects: corpus.projects.length,
    topics: corpus.topics.length,
    concepts: corpus.concepts.length,
    outputs: corpus.outputs.length,
    writing: corpus.writing.length,
    posts: corpus.posts.length,
    talks: corpus.talks.length,
    art: corpus.art.length,
    lab: corpus.lab.length,
    cv: corpus.cv.length,
    digest: corpus.digest.length,
    links: corpus.links.length,
    library: corpus.library.length,
  };

  console.log(
    `ok collections=${JSON.stringify(counts)} nodes=${stats.nodes} edges=${stats.edges} related=${stats.related}`,
  );
}

main();
