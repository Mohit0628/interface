import { defineErrorHandler } from "nitro/app"

/**
 * Docs production error handler.
 *
 * Nitro 3 renamed the helper (`defineErrorHandler`) and reversed the signature
 * (error first, then the event). This file previously imported
 * `defineNitroErrorHandler` from `nitropack/runtime` — a Nitro 2 path that
 * survived the build as a bare specifier, so the built server could not start
 * (`Cannot find package 'nitropack'`). Delegating to the default handler keeps
 * the previous behaviour: the status comes from the error itself, so a 404
 * still renders as a 404.
 */
export default defineErrorHandler((error, event, { defaultHandler }) =>
  defaultHandler(error, event)
)
