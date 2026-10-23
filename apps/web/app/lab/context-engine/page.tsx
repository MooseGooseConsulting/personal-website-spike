import { ContextEngineLab } from "@/components/lab/context-engine-lab";

export const metadata = {
  title: "Notebook context engine — Lab",
  description:
    "Motion sketch of Patrick MacLyman’s personal notebook pipeline: radar ingest, MCP writes, typed graph, RRF related-links, git gate.",
};

export default function ContextEnginePage() {
  return <ContextEngineLab />;
}
