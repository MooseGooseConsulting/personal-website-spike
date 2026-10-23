import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadCorpus } from "@notebook/schema";
import { audioStubDir, ensureDir } from "./paths.ts";

/** Silent 16-bit PCM WAV. Player can point at this until real TTS exists. Kokoro is skipped. */
export function silentWav(durationSec = 0.5, sampleRate = 8000): Buffer {
  const numSamples = Math.max(1, Math.floor(durationSec * sampleRate));
  const dataSize = numSamples * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  return buf;
}

export interface TtsRenderResult {
  slug: string;
  path: string;
  publicUrl: string;
  transcriptChars: number;
  skippedKokoro: true;
}

export function renderSilentStub(slug: string, durationSec = 0.5): TtsRenderResult {
  const corpus = loadCorpus();
  const issue = corpus.digest.find((doc) => doc.slug === slug);
  const transcript = issue?.data.transcript ?? "";
  const dir = audioStubDir();
  ensureDir(dir);
  const filename = `${slug}.stub.wav`;
  const path = join(dir, filename);
  writeFileSync(path, silentWav(durationSec));
  return {
    slug,
    path,
    publicUrl: `/audio/digest/${filename}`,
    transcriptChars: transcript.length,
    skippedKokoro: true,
  };
}

export function renderAllSilentStubs(): TtsRenderResult[] {
  const corpus = loadCorpus();
  return corpus.digest.map((issue) => renderSilentStub(issue.slug));
}

export function stubExists(slug: string): boolean {
  return existsSync(join(audioStubDir(), `${slug}.stub.wav`));
}
