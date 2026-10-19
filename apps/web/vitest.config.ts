import { defineConfig, mergeConfig } from "vitest/config"
import viteTsConfigPaths from "vite-tsconfig-paths"
import { reactConfig } from "@repo/vitest-config/react"

export default mergeConfig(
  reactConfig,
  defineConfig({
    plugins: [
      viteTsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
    define: {
      self: "globalThis",
      "import.meta.env.VITE_NETWORK": JSON.stringify("testnet"),
      "import.meta.env.VITE_RPC_URL": JSON.stringify("https://soroban-testnet.stellar.org"),
      "import.meta.env.VITE_HORIZON_URL": JSON.stringify("https://horizon-testnet.stellar.org"),
    },
    test: {
      include: ["src/**/*.{test,spec}.{ts,tsx}", "test/**/*.{test,spec}.{ts,tsx}"],
      server: {
        deps: {
          inline: [
            "react",
            "react-dom",
            "react/jsx-runtime",
            "react/jsx-dev-runtime",
            "@testing-library/react",
            "@testing-library/user-event",
            "@testing-library/jest-dom",
          ],
        },
      },
    },
  }),
)
