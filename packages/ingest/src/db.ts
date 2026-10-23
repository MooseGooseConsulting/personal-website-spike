import { DatabaseSync } from "node:sqlite";
import { ensureParent, ingestDbPath } from "./paths.ts";

export interface CandidateRow {
  url: string;
  title: string;
  note: string | null;
  source: string;
  category: string;
  kind: string | null;
  published_at: string | null;
  fetched_at: string;
  status: string;
}

let cached: DatabaseSync | undefined;

export function openIngestDb(): DatabaseSync {
  if (cached) return cached;
  const path = ingestDbPath();
  ensureParent(path);
  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS candidates (
      url TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      note TEXT,
      source TEXT NOT NULL,
      category TEXT NOT NULL,
      kind TEXT,
      published_at TEXT,
      fetched_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new'
    );
  `);
  cached = db;
  return db;
}

export function upsertCandidate(
  db: DatabaseSync,
  row: Omit<CandidateRow, "fetched_at" | "status"> & { status?: string },
): void {
  const fetchedAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO candidates (url, title, note, source, category, kind, published_at, fetched_at, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(url) DO UPDATE SET
       title = excluded.title,
       note = excluded.note,
       source = excluded.source,
       category = excluded.category,
       kind = excluded.kind,
       published_at = excluded.published_at,
       fetched_at = excluded.fetched_at`,
  ).run(
    row.url,
    row.title,
    row.note,
    row.source,
    row.category,
    row.kind,
    row.published_at,
    fetchedAt,
    row.status ?? "new",
  );
}

export function listCandidates(db: DatabaseSync, status = "new", limit = 50): CandidateRow[] {
  const stmt = db.prepare(
    `SELECT url, title, note, source, category, kind, published_at, fetched_at, status
     FROM candidates
     WHERE status = ?
     ORDER BY fetched_at DESC
     LIMIT ?`,
  );
  return stmt.all(status, limit) as CandidateRow[];
}
