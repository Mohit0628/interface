/**
 * apps/web/test/config-harness.ts
 *
 * Helpers for the config tests (env.ts / network.ts).
 *
 * Both modules evaluate `import.meta.env.VITE_*` (→ process.env under Bun) at
 * module-load time. To exercise different environments we must load each module
 * with a *fresh module graph* and a *fresh set of env vars* — a plain
 * cache-busting dynamic import is not enough because a re-imported parent still
 * reuses its already-evaluated `./env` child.
 *
 * The robust, leak-proof way to get that is a child process per scenario:
 *   - the module graph is brand new every time (true "reset module cache"),
 *   - env vars set for one scenario can never poison another test file, and
 *   - a missing-var throw surfaces as structured JSON we can assert on.
 */

import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

/** apps/web directory (this file lives in apps/web/test). */
const WEB_DIR = fileURLToPath(new URL("..", import.meta.url))

/** A complete, valid set of the env vars env.ts requires. */
export const VALID_ENV: Record<string, string> = {
  VITE_NETWORK: "testnet",
  VITE_RPC_URL: "https://rpc.example.test",
  VITE_HORIZON_URL: "https://horizon.example.test",
}

/** Every VITE_ key this harness ever touches (used to scrub inherited env). */
const ALL_VITE_KEYS = [...Object.keys(VALID_ENV), "VITE_ORACLE_URL"]

/**
 * Run a snippet in a fresh Bun subprocess with a controlled env.
 * Inherited VITE_ vars are scrubbed so only `env` matters.
 */
function runInSubprocess(
  env: Record<string, string | undefined>,
  code: string
): { stdout: string; stderr: string; exitCode: number } {
  const childEnv: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined && !ALL_VITE_KEYS.includes(key))
      childEnv[key] = value
  }
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) childEnv[key] = value
  }

  const result = spawnSync(process.execPath, ["-e", code], {
    cwd: WEB_DIR,
    env: childEnv,
    encoding: "utf8",
  })

  return {
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.status ?? 1,
  }
}

export type LoadEnvResult = {
  ok: boolean
  /** Thrown message on failure, "" on success. */
  message: string
  /** Resolved ENV on success, null on failure. */
  env: Record<string, unknown> | null
}

/** Load env.ts under `env`; returns the resolved ENV or the thrown message. */
export function loadEnv(
  env: Record<string, string | undefined>
): LoadEnvResult {
  const target = fileURLToPath(
    new URL("../src/app/config/env.ts", import.meta.url)
  )
  const code = `
    try {
      const m = await import(${JSON.stringify(target)})
      process.stdout.write(JSON.stringify({ ok: true, message: "", env: m.ENV }))
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      process.stdout.write(JSON.stringify({ ok: false, message, env: null }))
    }
  `
  const { stdout, stderr, exitCode } = runInSubprocess(env, code)
  if (!stdout) {
    throw new Error(
      `env.ts subprocess produced no output (exit ${exitCode}): ${stderr}`
    )
  }
  return JSON.parse(stdout) as LoadEnvResult
}

export type NetworkSnapshot = {
  name: string
  rpcUrl: string
  horizonUrl: string
  networkPassphrase: string
  explorerBaseUrl: string
  txUrl: string
  accountUrl: string
}

/** Load network.ts under `env`; returns the derived NETWORK config + helper URLs. */
export function loadNetwork(
  env: Record<string, string | undefined>
): NetworkSnapshot {
  const target = fileURLToPath(
    new URL("../src/app/config/network.ts", import.meta.url)
  )
  const code = `
    const n = await import(${JSON.stringify(target)})
    process.stdout.write(JSON.stringify({
      name: n.NETWORK.name,
      rpcUrl: n.NETWORK.rpcUrl,
      horizonUrl: n.NETWORK.horizonUrl,
      networkPassphrase: n.NETWORK.networkPassphrase,
      explorerBaseUrl: n.NETWORK.explorerBaseUrl,
      txUrl: n.explorerTxUrl("TXHASH"),
      accountUrl: n.explorerAccountUrl("GACCOUNT"),
    }))
  `
  const { stdout, stderr, exitCode } = runInSubprocess(env, code)
  if (!stdout) {
    throw new Error(
      `network.ts subprocess produced no output (exit ${exitCode}): ${stderr}`
    )
  }
  return JSON.parse(stdout) as NetworkSnapshot
}
