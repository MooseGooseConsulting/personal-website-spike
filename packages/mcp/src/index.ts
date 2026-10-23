import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { listenHttp } from "./http.ts";
import { createNotebookMcpServer } from "./server.ts";

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

async function main(): Promise<void> {
  if (process.argv.includes("--http")) {
    const port = Number(flag("--port") ?? process.env.MCP_PORT ?? 3333);
    listenHttp(port);
    return;
  }

  const server = createNotebookMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
