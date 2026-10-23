import { createServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createNotebookMcpServer } from "./server.ts";
import { errorToolResult, executeTool, jsonToolResult } from "./tools.ts";

async function readBody(req: import("node:http").IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function listenHttp(port = Number(process.env.MCP_PORT ?? 3333), host = "127.0.0.1"): void {
  const httpServer = createServer(async (req, res) => {
    const url = req.url ?? "/";
    try {
      if (req.method === "GET" && (url === "/health" || url === "/")) {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true, server: "notebook", mcp: "/mcp", invoke: "POST /invoke" }));
        return;
      }

      if (req.method === "POST" && url === "/invoke") {
        const raw = await readBody(req);
        const parsed = JSON.parse(raw || "{}") as { name?: string; arguments?: unknown };
        if (!parsed.name) {
          res.writeHead(400, { "content-type": "application/json" });
          res.end(JSON.stringify({ error: "JSON body { name, arguments } required" }));
          return;
        }
        try {
          const result = await executeTool(parsed.name, parsed.arguments ?? {});
          res.writeHead(200, { "content-type": "application/json" });
          res.end(JSON.stringify(jsonToolResult(result)));
        } catch (error) {
          res.writeHead(400, { "content-type": "application/json" });
          res.end(JSON.stringify(errorToolResult(error)));
        }
        return;
      }

      if (url === "/mcp" || url.startsWith("/mcp?")) {
        const mcp = createNotebookMcpServer();
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        await mcp.connect(transport);
        await transport.handleRequest(req, res);
        return;
      }

      res.writeHead(404, { "content-type": "text/plain" });
      res.end("not found");
    } catch (error) {
      if (!res.headersSent) {
        res.writeHead(500, { "content-type": "application/json" });
      }
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
    }
  });

  httpServer.listen(port, host, () => {
    console.error(`notebook MCP HTTP http://${host}:${port}/mcp (debug POST /invoke)`);
  });
}
