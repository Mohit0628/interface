/**
 * Debug logger that's silent in production builds.
 * Routes console output through this utility to prevent wallet addresses
 * and sensitive data from being logged in production.
 */

type LogLevel = "log" | "debug" | "info" | "warn" | "error"

class DebugLogger {
  private isProduction = import.meta.env.PROD

  private log(level: LogLevel, ...args: unknown[]) {
    if (this.isProduction) {
      return
    }
    console[level]("[DEBUG]", ...args)
  }

  log(...args: unknown[]) {
    this.log("log", ...args)
  }

  debug(...args: unknown[]) {
    this.log("debug", ...args)
  }

  info(...args: unknown[]) {
    this.log("info", ...args)
  }

  warn(...args: unknown[]) {
    this.log("warn", ...args)
  }

  error(...args: unknown[]) {
    this.log("error", ...args)
  }
}

export const debugLogger = new DebugLogger()
