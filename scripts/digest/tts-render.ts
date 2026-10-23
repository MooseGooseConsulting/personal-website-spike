#!/usr/bin/env node
import { renderAllSilentStubs, renderSilentStub } from "../../packages/ingest/src/tts.ts";

const args = process.argv.slice(2);
const slugIndex = args.indexOf("--slug");
const slug = slugIndex === -1 ? undefined : args[slugIndex + 1];

const result = slug ? [renderSilentStub(slug)] : args.includes("--all") ? renderAllSilentStubs() : null;
if (!result) {
  console.error("usage: scripts/digest/tts-render.ts --slug <digest-slug> | --all");
  process.exit(1);
}
console.log(JSON.stringify(result, null, 2));
