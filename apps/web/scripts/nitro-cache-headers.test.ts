/**
 * Cache-headers integration check (OB-125 follow-up).
 *
 * Requires a production build first:
 *   bun run --cwd apps/web build
 *   bun run --cwd apps/web test:cache-headers
 *
 * Spawns the built Nitro server and verifies the route rules from
 * src/shared/lib/cache-headers.ts against real HTTP responses:
 * - hashed Vite assets under /assets (where fonts and images land) get the
 *   immutable cache header through directory rules — extension globs such as
 *   `/**\/*.woff2` are rejected by rou3/h3 2.x;
 * - non-hashed public files keep revalidating instead of being pinned.
 *
 * Uses node:http rather than fetch because bunfig.toml preloads happy-dom,
 * whose fetch enforces browser CORS rules.
 */
import { request } from "node:http"
import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { afterAll, beforeAll, expect, test } from "bun:test"
import { spawn } from "bun"
import type { Subprocess } from "bun"

const PORT = 3212
const IMMUTABLE = "public, max-age=31536000, immutable"
const REVALIDATING = "public, no-cache, max-age=0, must-revalidate"

const appRoot = join(import.meta.dirname, "..")

let server: Subprocess

type HttpResponse = {
  status: number
  headers: Record<string, string | Array<string> | undefined>
}

function httpGet(path: string): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const req = request(
      { host: "localhost", port: PORT, path, method: "GET" },
      (res) => {
        res.resume()
        res.on("end", () =>
          resolve({ status: res.statusCode ?? 0, headers: res.headers }),
        )
      },
    )
    req.on("error", reject)
    req.end()
  })
}

async function findAsset(extension: string): Promise<string | null> {
  const entries = await readdir(join(appRoot, ".output/public/assets"))
  return entries.find((entry) => entry.endsWith(extension)) ?? null
}

beforeAll(async () => {
  server = spawn(["node", join(appRoot, ".output/server/index.mjs")], {
    env: { ...process.env, PORT: String(PORT) },
    stdout: "ignore",
    stderr: "ignore",
  })

  for (let i = 0; i < 100; i++) {
    try {
      await httpGet("/")
      return
    } catch {
      await Bun.sleep(100)
    }
  }
  throw new Error(
    "built Nitro server did not start — run `bun run --cwd apps/web build` first",
  )
})

afterAll(() => {
  server.kill()
})

test("hashed .woff2 font requests get the immutable cache header", async () => {
  const font = await findAsset(".woff2")
  expect(font).not.toBeNull()

  const res = await httpGet(`/assets/${font}`)
  expect(res.status).toBe(200)
  expect(res.headers["cache-control"]).toBe(IMMUTABLE)
})

test("hashed .png requests get the immutable cache header", async () => {
  // This build emits no images, but the /assets/** rule covers everything
  // Vite hashes, so a synthetic path exercises the same rule.
  const res = await httpGet("/assets/token-icon-4f2a91.png")
  expect(res.headers["cache-control"]).toBe(IMMUTABLE)
})

test("non-hashed public files stay revalidating", async () => {
  const res = await httpGet("/favicon.ico")
  expect(res.status).toBe(200)
  expect(res.headers["cache-control"]).toBe(REVALIDATING)
})
