import { allLinks } from "content-collections";
import { RadarStage, type RadarItemView } from "@/components/sections/radar-stage";
import { iso } from "@/lib/format";

export const metadata = {
  title: "Radar — Patrick MacLyman",
  description: "Categorized watchlist from the links inbox.",
};

export default function RadarPage() {
  const items: RadarItemView[] = (allLinks[0]?.items ?? []).map((item) => ({
    title: item.title,
    url: item.url,
    category: item.category,
    kind: item.kind,
    note: item.note,
    tags: item.tags,
    added: iso(item.added) ?? "",
    featured: item.featured,
  }));

  return <RadarStage items={items} />;
}
