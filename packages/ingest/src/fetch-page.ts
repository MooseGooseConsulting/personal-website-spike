import type { RadarItem } from "@notebook/schema";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_BYTES = 512_000;
const USER_AGENT = "NotebookRadar/0.1 (git-as-CMS ingest; +local)";

export type RadarKind = RadarItem["kind"];

export interface FetchedPage {
  url: string;
  finalUrl: string;
  title: string;
  note: string;
  kind: RadarKind;
  contentType: string;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCharCode(Number.parseInt(n, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function metaContent(html: string, key: string): string | undefined {
  const property = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']*)["'][^>]*>`,
    "i",
  );
  const propertyFlip = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${key}["'][^>]*>`,
    "i",
  );
  return property.exec(html)?.[1] ?? propertyFlip.exec(html)?.[1];
}

export function inferKind(url: string): RadarKind {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "other";
  }
  if (host === "github.com" || host === "gitlab.com") return "repo";
  if (host === "arxiv.org" || host.endsWith(".arxiv.org")) return "paper";
  if (host === "youtube.com" || host === "youtu.be") return "video";
  if (host === "x.com" || host === "twitter.com" || host === "bsky.app") return "thread";
  if (/\.pdf$/i.test(new URL(url).pathname)) return "paper";
  return "article";
}

function titleFromHtml(html: string, url: string): string {
  const og = metaContent(html, "og:title");
  if (og) return decodeEntities(og);
  const twitter = metaContent(html, "twitter:title");
  if (twitter) return decodeEntities(twitter);
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  if (title) return decodeEntities(title);
  return `${new URL(url).hostname} (fetched; no title tag)`;
}

function noteFromHtml(html: string, url: string, title: string): string {
  const og = metaContent(html, "og:description") ?? metaContent(html, "description");
  if (og) {
    const decoded = decodeEntities(og);
    if (decoded.length > 20) {
      return decoded.length > 480 ? `${decoded.slice(0, 477)}…` : decoded;
    }
  }
  const host = new URL(url).hostname;
  return `Fetched from ${host} on ${new Date().toISOString().slice(0, 10)}. Title on the page: ${title}.`;
}

export async function fetchPage(url: string): Promise<FetchedPage> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Only http(s) URLs can be fetched: ${url}`);
  }

  const response = await fetch(parsed, {
    redirect: "follow",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed (${response.status} ${response.statusText}) for ${url}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const reader = response.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        chunks.push(value.slice(0, Math.max(0, MAX_BYTES - (size - value.byteLength))));
        break;
      }
      chunks.push(value);
    }
  } else {
    const buf = new Uint8Array(await response.arrayBuffer());
    chunks.push(buf.byteLength > MAX_BYTES ? buf.slice(0, MAX_BYTES) : buf);
  }
  const bytes = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  const text = bytes.toString("utf8");
  const finalUrl = response.url || url;

  if (!/html|xml|text\//i.test(contentType) && !text.trimStart().startsWith("<")) {
    const host = new URL(finalUrl).hostname;
    return {
      url,
      finalUrl,
      title: `${host} (fetched; non-HTML ${contentType || "unknown type"})`,
      note: `Fetched ${finalUrl} as ${contentType || "unknown"}. No HTML title/description to quote.`,
      kind: inferKind(finalUrl),
      contentType,
    };
  }

  const title = titleFromHtml(text, finalUrl);
  return {
    url,
    finalUrl,
    title,
    note: noteFromHtml(text, finalUrl, title),
    kind: inferKind(finalUrl),
    contentType,
  };
}
