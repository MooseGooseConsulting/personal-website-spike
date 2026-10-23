#!/usr/bin/env node
import { runIngestCli } from "../../packages/ingest/src/cli.ts";

await runIngestCli(["radar", ...process.argv.slice(2)]);
