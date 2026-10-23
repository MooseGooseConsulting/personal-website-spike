import { allArts } from "content-collections";
import { ArtStage, type ArtView } from "@/components/sections/art-stage";

export const metadata = {
  title: "Art — Patrick MacLyman",
  description: "Visualization and deck workshop gallery.",
};

export default function ArtPage() {
  const works: ArtView[] = [...allArts]
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .map((row) => ({
      slug: row.slug,
      title: row.title,
      medium: row.medium,
      section: row.section,
      year: row.year,
      description: row.description,
      content: row.content,
      todo: row.TODO,
    }));

  return <ArtStage works={works} />;
}
