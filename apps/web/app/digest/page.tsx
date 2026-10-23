import { allDigests } from "content-collections";
import { DigestStage, type DigestView } from "@/components/sections/digest-stage";
import { iso } from "@/lib/format";

export const metadata = {
  title: "Digest — Patrick MacLyman",
  description: "Filterable notebook issues with transcript and waveform player.",
};

export default function DigestPage() {
  const issues: DigestView[] = [...allDigests]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((issue) => ({
      slug: issue.slug,
      title: issue.title,
      cadence: issue.cadence,
      track: issue.track,
      origin: issue.origin,
      date: iso(issue.date) ?? "",
      summary: issue.summary,
      content: issue.content,
      transcript: issue.transcript,
      audioUrl: issue.audioUrl,
      durationSec: issue.durationSec,
      highlights: issue.highlights,
      items: issue.items,
    }));

  return <DigestStage issues={issues} />;
}
