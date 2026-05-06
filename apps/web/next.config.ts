import type { NextConfig } from "next"
import path from "path"

const config: NextConfig = {
  transpilePackages: ["@vandu/db", "@vandu/types", "@vandu/validators"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
  outputFileTracingIncludes: {
    "/**": ["../../packages/db/generated/client/**/*"],
  },
}

export default config
