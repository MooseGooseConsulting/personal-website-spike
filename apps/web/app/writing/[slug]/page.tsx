import { allPosts } from "content-collections";
import { notFound } from "next/navigation";
import { WritingArticle } from "@/components/sections/writing-article";
import { iso } from "@/lib/format";

export function generateStaticParams() {
  return allPosts.filter((post) => !post.draft).map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

type WritingParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: WritingParams) {
  const { slug } = await params;
  const post = allPosts.find((row) => row.slug === slug);
  return {
    title: post ? `${post.title} — Patrick MacLyman` : "Writing",
    description: post?.description,
  };
}

export default async function WritingSlugPage({ params }: WritingParams) {
  const { slug } = await params;
  const post = allPosts.find((row) => row.slug === slug && !row.draft);
  if (!post) notFound();

  return (
    <WritingArticle
      slug={post.slug}
      title={post.title}
      subtitle={post.subtitle}
      date={iso(post.date)}
      content={post.content}
      tags={post.tags}
    />
  );
}
