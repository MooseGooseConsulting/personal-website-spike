import { allLabs } from "content-collections";
import { LabStage, type LabView } from "@/components/sections/lab-stage";

export const metadata = {
  title: "Lab — Patrick MacLyman",
  description: "Homelab, BEAST, Broadside.",
};

export default function LabPage() {
  const labs: LabView[] = allLabs.map((row) => ({
    slug: row.slug,
    title: row.title,
    status: row.status,
    kind: row.kind,
    summary: row.summary,
    content: row.content,
    featured: row.featured,
    todo: row.TODO,
  }));

  return <LabStage labs={labs} />;
}
