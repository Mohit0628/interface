import { defineHandler } from "nitro"

/**
 * Same-origin Hermes proxy. PYTH_API_KEY is read only on the server; never
 * expose it via VITE_ variables or forward arbitrary client-provided URLs.
 */
export default defineHandler(async (event) => {
  const path = event.url.pathname.replace(/^\/api\/pyth/, "")
  if (event.req.method !== "GET" || path !== "/v2/updates/price/latest") {
    return new Response("Not found", { status: 404 })
  }

  const apiKey = process.env.PYTH_API_KEY
  if (!apiKey) {
    return new Response("Pyth price feed is not configured", { status: 503 })
  }

  const query = new URLSearchParams(event.url.search)
  const ids = query.getAll("ids[]")
  if (ids.length === 0 || ids.length > 20 ||
      ids.some((id) => !(/^(0x)?[a-fA-F0-9]{64}$/.test(id)))) {
    return new Response("Invalid price feed IDs", { status: 400 })
  }

  const remote = new URL("https://pyth.dourolabs.app/hermes/v2/updates/price/latest")
  remote.search = query.toString()
  try {
    const response = await fetch(remote, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    })
    return new Response(response.body, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store" },
    })
  } catch {
    return new Response("Pyth service unavailable", { status: 502 })
  }
})
