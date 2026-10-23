import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";

const nextConfig: NextConfig = {
  transpilePackages: ["@notebook/schema"],
};

// withContentCollections must be the outermost plugin.
export default withContentCollections(nextConfig);
