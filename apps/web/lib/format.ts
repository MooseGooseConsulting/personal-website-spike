export function asDate(value: Date | string | number | undefined | null): Date | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function iso(value: Date | string | number | undefined | null): string | undefined {
  return asDate(value)?.toISOString();
}

export function formatDate(
  value: Date | string | number | undefined | null,
  opts: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" },
): string {
  const date = asDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", opts).format(date);
}

export function formatRange(
  start: Date | string | number | undefined | null,
  end?: Date | string | number | undefined | null,
  current?: boolean,
): string {
  const from = formatDate(start);
  if (current) return from ? `${from} — now` : "now";
  const to = formatDate(end);
  if (from && to && from !== to) return `${from} — ${to}`;
  return from || to;
}

export function yearOf(value: Date | string | number | undefined | null): string {
  return formatDate(value, { year: "numeric" });
}
