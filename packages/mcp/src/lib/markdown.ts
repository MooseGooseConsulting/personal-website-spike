import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { stringify } from "yaml";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date);
}

export function formatDayish(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map(formatDayish);
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, formatDayish(nested)]));
  }
  return value;
}

export function stripEmpty(value: unknown): unknown {
  const dated = formatDayish(value);
  if (Array.isArray(dated)) {
    const next = dated.map(stripEmpty).filter((item) => item !== undefined);
    return next.length > 0 ? next : undefined;
  }
  if (isPlainObject(dated)) {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(dated)) {
      if (key === "content") continue;
      const next = stripEmpty(nested);
      if (next === undefined || next === "") continue;
      if (next === false && key !== "featured" && key !== "current" && key !== "draft" && key !== "unlisted") {
        continue;
      }
      out[key] = next;
    }
    return out;
  }
  return dated;
}

export function writeMarkdown(file: string, data: Record<string, unknown>, body: string): void {
  const front = stripEmpty(data) as Record<string, unknown>;
  const yaml = stringify(front, { lineWidth: 96, defaultStringType: "QUOTE_DOUBLE" });
  mkdirSync(dirname(file), { recursive: true });
  const content = body.trim();
  writeFileSync(file, content ? `---\n${yaml}---\n\n${content}\n` : `---\n${yaml}---\n`);
}

export function writeYamlFile(file: string, data: unknown): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, stringify(data, { lineWidth: 96, defaultStringType: "QUOTE_DOUBLE" }));
}

export function writeJsonFile(file: string, data: unknown): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}
