import { existsSync, readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { fetchPage } from "./fetch-page.ts";
import { listCandidates, openIngestDb, upsertCandidate } from "./db.ts";
import { feedsPath } from "./paths.ts";

export interface FeedConfig {
  id: string;
  title: string;
  url: string;
  category: string;
  kind?: string;
}

interface FeedsFile {
  feeds?: FeedConfig[];
}

export function loadFeeds(path = feedsPath()): FeedConfig[] {
  if (!existsSync(path)) return [];
  const parsed = parseYaml(readFileSync(path, "utf8")) as FeedsFile;
  return parsed.feeds ?? [];
}

function decodeXml(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string): string | undefined {
  const cdata = new RegExp(`<${name}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${name}>`, "i").exec(block);
  if (cdata) return cdata[1].trim();
  const plain = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i").exec(block);
  return plain ? decodeXml(plain[1]) : undefined;
}

function atomLink(block: string): string | undefined {
  const href = /<link[^>]+href=["']([^"']+)["'][^>]*>/i.exec(block);
  if (href) return href[1];
  return tag(block, "link");
}

export interface RssEntry {
  title: string;
  url: string;
  note?: string;
  publishedAt?: string;
}

export function parseFeedXml(xml: string): RssEntry[] {
  const items: RssEntry[] = [];
  const rssItems = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
  for (const block of rssItems) {
    const url = tag(block, "link") ?? tag(block, "guid");
    const title = tag(block, "title");
    if (!url || !title) continue;
    items.push({
      title,
      url,
      note: tag(block, "description") ?? tag(block, "summary"),
      publishedAt: tag(block, "pubDate") ?? tag(block, "dc:date"),
    });
  }
  if (items.length > 0) return items;

  const entries = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  for (const block of entries) {
    const url = atomLink(block);
    const title = tag(block, "title");
    if (!url || !title) continue;
    items.push({
      title,
      url,
      note: tag(block, "summary") ?? tag(block, "content"),
      publishedAt: tag(block, "updated") ?? tag(block, "published"),
    });
  }
  return items;
}

export interface RadarIngestResult {
  feeds: { id: string; fetched: number; stored: number; error?: string }[];
  urls: { url: string; stored: boolean; error?: string }[];
  newCount: number;
}

export async function ingestFeeds(limitPerFeed = 25): Promise<RadarIngestResult> {
  const db = openIngestDb();
  const result: RadarIngestResult = { feeds: [], urls: [], newCount: 0 };
  const before = listCandidates(db, "new", 10_000).length;

  for (const feed of loadFeeds()) {
    try {
      const response = await fetch(feed.url, {
        signal: AbortSignal.timeout(15_000),
        headers: { "user-agent": "NotebookRadar/0.1", accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" },
      });
      if (!response.ok) {
        result.feeds.push({ id: feed.id, fetched: 0, stored: 0, error: `${response.status}` });
        continue;
      }
      const xml = await response.text();
      const entries = parseFeedXml(xml).slice(0, limitPerFeed);
      let stored = 0;
      for (const entry of entries) {
        upsertCandidate(db, {
          url: entry.url,
          title: entry.title,
          note: entry.note ?? null,
          source: feed.id,
          category: feed.category,
          kind: feed.kind ?? "article",
          published_at: entry.publishedAt ?? null,
        });
        stored += 1;
      }
      result.feeds.push({ id: feed.id, fetched: entries.length, stored });
    } catch (error) {
      result.feeds.push({
        id: feed.id,
        fetched: 0,
        stored: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  result.newCount = listCandidates(db, "new", 10_000).length - before;
  return result;
}

export async function ingestUrl(url: string, category = "Inbox"): Promise<RadarIngestResult> {
  const db = openIngestDb();
  const page = await fetchPage(url);
  upsertCandidate(db, {
    url: page.finalUrl,
    title: page.title,
    note: page.note,
    source: "url",
    category,
    kind: page.kind,
    published_at: null,
  });
  return {
    feeds: [],
    urls: [{ url: page.finalUrl, stored: true }],
    newCount: 1,
  };
}
