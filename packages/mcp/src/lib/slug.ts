export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function assertSlug(slug: string): string {
  if (!SLUG_RE.test(slug)) {
    throw new Error(`Invalid slug "${slug}". Use kebab-case [a-z0-9-].`);
  }
  return slug;
}

export function formatDay(value: Date | string | number): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${String(value)}`);
  }
  return date.toISOString().slice(0, 10);
}
