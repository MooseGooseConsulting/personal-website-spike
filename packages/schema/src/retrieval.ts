const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "are",
  "was",
  "were",
  "but",
  "not",
  "you",
  "your",
  "our",
  "their",
  "its",
  "into",
  "over",
  "than",
  "then",
  "they",
  "them",
  "what",
  "which",
  "how",
  "why",
  "who",
  "can",
  "could",
  "would",
  "should",
  "about",
  "across",
  "via",
  "use",
  "uses",
  "using",
  "used",
  "more",
  "most",
  "some",
  "such",
  "other",
  "one",
  "two",
  "have",
  "has",
  "had",
]);

export function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return matches.filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

export interface Scored {
  id: string;
  score: number;
}

interface Bm25Doc {
  id: string;
  tokens: string[];
}

export interface Bm25Index {
  docs: Bm25Doc[];
  df: Map<string, number>;
  avgLen: number;
  n: number;
}

export function buildBm25(docs: Bm25Doc[]): Bm25Index {
  const df = new Map<string, number>();
  let totalLen = 0;
  for (const doc of docs) {
    totalLen += doc.tokens.length;
    for (const term of new Set(doc.tokens)) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }
  return {
    docs,
    df,
    avgLen: totalLen / Math.max(docs.length, 1),
    n: docs.length,
  };
}

export function bm25Query(
  index: Bm25Index,
  queryTokens: string[],
  excludeId: string,
  k1 = 1.5,
  b = 0.75,
): Scored[] {
  const queryTerms = new Set(queryTokens);
  const results: Scored[] = [];
  for (const doc of index.docs) {
    if (doc.id === excludeId) continue;
    const len = doc.tokens.length;
    const tf = new Map<string, number>();
    for (const token of doc.tokens) {
      if (queryTerms.has(token)) tf.set(token, (tf.get(token) ?? 0) + 1);
    }
    let score = 0;
    for (const [term, freq] of tf) {
      const documentFreq = index.df.get(term) ?? 0;
      const idf = Math.log(
        1 + (index.n - documentFreq + 0.5) / (documentFreq + 0.5),
      );
      const denom = freq + k1 * (1 - b + (b * len) / index.avgLen);
      score += idf * ((freq * (k1 + 1)) / denom);
    }
    if (score > 0) results.push({ id: doc.id, score });
  }
  return results.sort((a, b) => b.score - a.score);
}

export function dot(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) sum += a[i] * b[i];
  return sum;
}

/** Deterministic hashed bag-of-words stub. Swap for real embeddings later. */
export function stubEmbed(tokens: string[], dim = 64): number[] {
  const vector = new Array<number>(dim).fill(0);
  for (const token of tokens) {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i++) {
      hash = Math.imul(hash ^ token.charCodeAt(i), 16777619);
    }
    const unsigned = hash >>> 0;
    vector[unsigned % dim] += 1;
    vector[(unsigned >>> 8) % dim] += 0.5;
  }
  let norm = 0;
  for (const value of vector) norm += value * value;
  norm = Math.sqrt(norm) || 1;
  return vector.map((value) => value / norm);
}

export function semanticQuery(
  vectors: Record<string, number[]>,
  queryVec: number[],
  excludeId: string,
): Scored[] {
  const results: Scored[] = [];
  for (const [id, vec] of Object.entries(vectors)) {
    if (id === excludeId) continue;
    results.push({ id, score: dot(queryVec, vec) });
  }
  return results.sort((a, b) => b.score - a.score);
}

/** Reciprocal Rank Fusion. score(id) = Σ 1 / (k + rank), rank 0-based. */
export function rrf(rankings: Scored[][], k = 60): Scored[] {
  const fused = new Map<string, number>();
  for (const ranking of rankings) {
    ranking.forEach((item, rank) => {
      fused.set(item.id, (fused.get(item.id) ?? 0) + 1 / (k + rank));
    });
  }
  return [...fused.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
}
