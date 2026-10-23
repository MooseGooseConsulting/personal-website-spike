import { allCvs } from "content-collections";
import { CvStage, type CvView } from "@/components/sections/cv-stage";
import { iso } from "@/lib/format";

export const metadata = {
  title: "CV — Patrick MacLyman",
  description: "Stacked timeline from the public bio.",
};

export default function CvPage() {
  const entries: CvView[] = allCvs.map((row) => ({
    slug: row.slug,
    title: row.title,
    org: row.org,
    location: row.location,
    category: row.category,
    start: iso(row.range.start) ?? "",
    end: iso(row.range.end),
    current: row.current,
    summary: row.summary,
    highlights: row.highlights,
    content: row.content,
    todo: row.TODO,
    order: row.order,
  }));

  return <CvStage entries={entries} />;
}
