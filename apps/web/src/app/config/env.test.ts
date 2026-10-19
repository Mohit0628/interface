/**
 * apps/web/src/app/config/env.test.ts  (issue #243)
 *
 * Proves startup validation fails loudly when a required VITE_ var is missing.
 *
 * Each scenario loads env.ts in its own fresh Bun subprocess (see
 * test/config-harness.ts). That guarantees:
 *   - module imports are isolated per test (fresh module graph every time),
 *   - env vars set for one scenario never poison another test file, and
 *   - the module-load throw is captured exactly instead of aborting the suite.
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { VALID_ENV, loadEnv } from "../../../test/config-harness"

/** A full valid env with a single required key removed. */
function envWithout(key: keyof typeof VALID_ENV): Record<string, string> {
  const env: Record<string, string> = { ...VALID_ENV }
  delete env[key]
  return env
}

describe("ENV startup validation (#243)", () => {
  it("throws the exact error when VITE_NETWORK is missing", () => {
    const result = loadEnv(envWithout("VITE_NETWORK"))
    assert.equal(result.ok, false)
    assert.equal(result.message, "Missing env var: VITE_NETWORK")
  })

  it("throws the exact error when VITE_RPC_URL is missing", () => {
    const result = loadEnv(envWithout("VITE_RPC_URL"))
    assert.equal(result.ok, false)
    assert.equal(result.message, "Missing env var: VITE_RPC_URL")
  })

  it("throws the exact error when VITE_HORIZON_URL is missing", () => {
    const result = loadEnv(envWithout("VITE_HORIZON_URL"))
    assert.equal(result.ok, false)
    assert.equal(result.message, "Missing env var: VITE_HORIZON_URL")
  })


  it("loads successfully and derives values when every required var is present", () => {
    const result = loadEnv(VALID_ENV)
    assert.equal(result.ok, true)
    assert.ok(result.env)
    assert.equal(result.env.NETWORK, "testnet")
    assert.equal(result.env.RPC_URL, VALID_ENV.VITE_RPC_URL)
    assert.equal(result.env.HORIZON_URL, VALID_ENV.VITE_HORIZON_URL)
    // ORACLE_URL is optional and falls back when unset.
    assert.equal(result.env.ORACLE_URL, "https://arbitrum-api.gmxinfra.io")
  })
})
