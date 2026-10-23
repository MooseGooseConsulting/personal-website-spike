import { allWritings } from "content-collections";
import { WritingIndex, type WritingIndexItem } from "@/components/sections/writing-index";
import { iso } from "@/lib/format";

export const metadata = {
  title: "Writing — Patrick MacLyman",
  description: "On-site essays and external index.",
};

export default function WritingPage() {
  const items: WritingIndexItem[] = [...allWritings]
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
    .map((row) => ({
      slug: row.slug,
      title: row.title,
      description: row.description,
      source: row.source,
      kind: row.kind,
      date: iso(row.date),
      href: row.source === "on-site" && row.post ? `/writing/${row.post}` : (row.url ?? "#"),
      tags: row.tags,
      featured: row.featured,
    }));

  return <WritingIndex items={items} />;
}
