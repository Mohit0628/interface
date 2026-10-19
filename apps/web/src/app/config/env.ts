/**
 * apps/web/src/app/config/env.ts
 *
 * Single source of truth for every VITE_ environment variable.
 * Evaluated at module-load time — a missing required var throws
 * "Missing env var: VITE_X" before any component renders, so
 * mis-configured deployments fail loudly.
 *
 * Usage:
 *   import { ENV } from "@/app/config/env"
 *   console.log(ENV.NETWORK)                   // "testnet" | "mainnet"
 *   console.log(ENV.RPC_URL)                   // RPC URL endpoint
 */

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function requireEnv(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing env var: ${name}`)
  return value
}

function optionalEnv(value: string | undefined, fallback = ""): string {
  return value ?? fallback
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Network = "testnet" | "mainnet"

export type Env = {
  NETWORK: Network
  RPC_URL: string
  HORIZON_URL: string
  ORACLE_URL: string
  PYTH_HERMES_URL: string
  INDEXER_GRAPHQL_URL?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// ENV — evaluated once at startup
// ─────────────────────────────────────────────────────────────────────────────

export const ENV: Env = {
  NETWORK: requireEnv(import.meta.env.VITE_NETWORK, "VITE_NETWORK") as Network,

  RPC_URL: requireEnv(import.meta.env.VITE_RPC_URL, "VITE_RPC_URL"),

  HORIZON_URL: requireEnv(import.meta.env.VITE_HORIZON_URL, "VITE_HORIZON_URL"),

  ORACLE_URL: optionalEnv(
    import.meta.env.VITE_ORACLE_URL,
    "https://arbitrum-api.gmxinfra.io",
  ),

  PYTH_HERMES_URL: optionalEnv(
    import.meta.env.VITE_PYTH_HERMES_URL,
    "/api/pyth",
  ),

  INDEXER_GRAPHQL_URL: optionalEnv(
    import.meta.env.VITE_INDEXER_GRAPHQL_URL,
    "",
  ),
}

