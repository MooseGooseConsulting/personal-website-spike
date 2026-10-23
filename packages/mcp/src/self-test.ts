import { readFileSync, writeFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { addRadarLink, getNode, listGraph, listUnresolved, validateSite } from "./actions.ts";
import { inboxFile, repoRoot } from "./lib/repo.ts";

const here = dirname(fileURLToPath(import.meta.url));

async function roundtripValidateSite(): Promise<unknown> {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      "--experimental-strip-types",
      "--no-warnings=ExperimentalWarning",
      join(here, "index.ts"),
    ],
    cwd: repoRoot(),
    stderr: "pipe",
  });
  const client = new Client({ name: "notebook-self-test", version: "0.1.0" });
  await client.connect(transport);
  try {
    const tools = await client.listTools();
    const result = await client.callTool({ name: "validate_site", arguments: {} });
    return { tools: tools.tools.map((tool) => tool.name), result };
  } finally {
    await client.close();
  }
}

async function main(): Promise<void> {
  const site = validateSite();
  if (!site.ok) {
    console.error(JSON.stringify(site.errors, null, 2));
    process.exitCode = 1;
    return;
  }

  const graph = listGraph({ limit: 5 });
  const node = getNode({ id: "project:coldsearch" });
  const unresolved = listUnresolved();
  const dryRadar = await addRadarLink({ url: "https://example.com/", category: "Inbox", dryRun: true });

  let liveRadar: unknown = null;
  const live = process.argv.includes("--live-radar");
  if (live) {
    const file = inboxFile();
    const backup = readFileSync(file, "utf8");
    try {
      liveRadar = await addRadarLink({ url: "https://example.com/", category: "Inbox" });
    } finally {
      writeFileSync(file, backup);
    }
  }

  let mcp: unknown = null;
  if (!process.argv.includes("--skip-stdio")) {
    mcp = await roundtripValidateSite();
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        validate_site: site,
        list_graph_sample: { stats: graph.stats, first: graph.nodes[0]?.id },
        get_node: node.node.id,
        list_unresolved: {
          todos: unresolved.todos.length,
          conceptsMissingTopic: unresolved.conceptsMissingTopic.length,
        },
        add_radar_link_dryRun: dryRadar,
        add_radar_link_live_reverted: liveRadar,
        stdio_roundtrip: mcp,
      },
      null,
      2,
    ),
  );
}

await main();
