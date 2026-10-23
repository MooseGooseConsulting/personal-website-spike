import {
  allArts,
  allConcepts,
  allCvs,
  allDigests,
  allLabs,
  allLibraries,
  allLinks,
  allOutputs,
  allPosts,
  allProjects,
  allTalks,
  allTopics,
  allWritings,
} from "content-collections";
import { HomeStage, type HomePayload } from "@/components/sections/home-stage";
import { nodeId } from "@/lib/graph-data";

export default function Home() {
  const current = [...allCvs].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)).find((row) => row.current);
  const digest = [...allDigests].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return db - da;
  })[0];
  const featuredProjects = [...allProjects]
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));
  const essay = allPosts.find((p) => p.slug === "the-model-will-do-exactly-what-you-told-it");

  const featured: HomePayload["featured"] = [];
  const coldsearch = featuredProjects.find((p) => p.slug === "coldsearch");
  const northstar = featuredProjects.find((p) => p.slug === "northstar-guardian");
  if (coldsearch) {
    featured.push({
      id: nodeId("project", coldsearch.slug),
      title: coldsearch.title,
      summary: coldsearch.summary,
      href: "/work#coldsearch",
      kicker: "Project",
    });
  }
  if (northstar) {
    featured.push({
      id: nodeId("project", northstar.slug),
      title: northstar.title,
      summary: northstar.summary,
      href: "/work#northstar-guardian",
      kicker: "Project",
    });
  }
  if (essay) {
    featured.push({
      id: nodeId("post", essay.slug),
      title: essay.title,
      summary: essay.description,
      href: `/writing/${essay.slug}`,
      kicker: "Writing",
    });
  }

  const payload: HomePayload = {
    collectionCount:
      allProjects.length +
      allTopics.length +
      allConcepts.length +
      allOutputs.length +
      allWritings.length +
      allPosts.length +
      allTalks.length +
      allArts.length +
      allLabs.length +
      allCvs.length +
      allDigests.length +
      allLinks.length +
      allLibraries.length,
    currently: {
      title: current?.title ?? "Head LLM Herder",
      org: current?.org ?? "MooseGoose Consulting",
      href: "/cv",
    },
    digest: {
      title: digest?.title ?? "Digest",
      slug: digest?.slug ?? "",
      summary: digest?.summary ?? "",
    },
    featured,
  };

  return <HomeStage payload={payload} />;
}
