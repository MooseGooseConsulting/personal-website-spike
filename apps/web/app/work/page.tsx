import { allOutputs, allProjects, allTopics } from "content-collections";
import { WorkExplorer, type WorkItem } from "@/components/sections/work-explorer";
import { nodeId, siteHref } from "@/lib/graph-data";

export const metadata = {
  title: "Work — Patrick MacLyman",
  description: "Projects, topics, and outputs explorer with list↔graph morph.",
};

export default function WorkPage() {
  const items: WorkItem[] = [
    ...allProjects.map((p) => ({
      id: nodeId("project", p.slug),
      kind: "project" as const,
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      href: siteHref({ type: "project", slug: p.slug, url: `/work#${p.slug}` }),
      meta: `${p.status} · ${p.domain}`,
      todo: p.TODO,
    })),
    ...allTopics.map((t) => ({
      id: nodeId("topic", t.slug),
      kind: "topic" as const,
      slug: t.slug,
      title: t.title,
      summary: t.summary,
      href: `/library#${t.slug}`,
      meta: "hub",
    })),
    ...allOutputs.map((o) => ({
      id: nodeId("output", o.slug),
      kind: "output" as const,
      slug: o.slug,
      title: o.title,
      summary: o.summary ?? "",
      href: o.url,
      meta: o.kind,
      todo: o.TODO,
    })),
  ];

  return <WorkExplorer items={items} />;
}
