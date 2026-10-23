import { loadCorpus } from "@notebook/schema";

export function publishedDigestUrls(root?: string): Set<string> {
  const corpus = loadCorpus(root);
  const urls = new Set<string>();
  for (const issue of corpus.digest) {
    for (const item of issue.data.items) {
      urls.add(item.url);
    }
  }
  return urls;
}

export function featuredRadarUrls(root?: string): Set<string> {
  const corpus = loadCorpus(root);
  return new Set(corpus.links.filter((item) => item.featured).map((item) => item.url));
}

export function repeatGuardHits(urls: string[], root?: string): string[] {
  const published = publishedDigestUrls(root);
  return [...new Set(urls)].filter((url) => published.has(url));
}
