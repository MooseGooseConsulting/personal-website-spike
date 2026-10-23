import { allTalks } from "content-collections";
import { TalksStage, type TalkView } from "@/components/sections/talks-stage";
import { iso } from "@/lib/format";

export const metadata = {
  title: "Talks — Patrick MacLyman",
  description: "Events and placeholders.",
};

export default function TalksPage() {
  const talks: TalkView[] = allTalks.map((talk) => ({
    slug: talk.slug,
    title: talk.title,
    event: talk.event,
    date: iso(talk.date) ?? "",
    kind: talk.kind,
    location: talk.location,
    description: talk.description,
    content: talk.content,
    todo: talk.TODO,
    slidesUrl: talk.slidesUrl,
    videoUrl: talk.videoUrl,
  }));

  return <TalksStage talks={talks} />;
}
