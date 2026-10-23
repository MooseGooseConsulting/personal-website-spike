import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  errorToolResult,
  executeTool,
  jsonToolResult,
  TOOL_NAMES,
  toolDescriptions,
  toolSchemas,
} from "./tools.ts";

export function createNotebookMcpServer(): McpServer {
  const server = new McpServer(
    { name: "notebook", version: "0.1.0" },
    {
      instructions:
        "Git-as-CMS admin for the Patrick MacLyman notebook. Write markdown/YAML under content/, validate with @notebook/schema, then commit. Never invent a radar note: fetch the URL. Push is the deploy signal; do not push unless asked.",
    },
  );

  for (const name of TOOL_NAMES) {
    server.registerTool(
      name,
      {
        description: toolDescriptions[name],
        inputSchema: toolSchemas[name],
      },
      async (args) => {
        try {
          const result = await executeTool(name, args ?? {});
          return jsonToolResult(result);
        } catch (error) {
          return errorToolResult(error);
        }
      },
    );
  }

  return server;
}
