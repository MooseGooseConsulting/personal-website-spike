import { allConcepts, allLibraries, allTopics } from "content-collections";
import { LibraryStage } from "@/components/sections/library-stage";

export const metadata = {
  title: "Library — Patrick MacLyman",
  description: "Topic libraries and spike-scale explorer maps.",
};

export default function LibraryPage() {
  return (
    <LibraryStage
      topics={allTopics.map((t) => ({
        slug: t.slug,
        title: t.title,
        summary: t.summary,
        content: t.content,
      }))}
      concepts={allConcepts.map((c) => ({
        slug: c.slug,
        label: c.label,
        definition: c.definition,
        topic: c.topic,
      }))}
      explorers={allLibraries.map((m) => ({
        id: m.id,
        title: m.title,
        summary: m.summary,
        topic: m.topic,
        nodes: m.nodes,
        edges: m.edges,
      }))}
    />
  );
}
