/**
 * Debug logger that's silent in production builds.
 * Routes console output through this utility to prevent wallet addresses
 * and sensitive data from being logged in production.
 */

type LogLevel = "log" | "debug" | "info" | "warn" | "error"

class DebugLogger {
  private isProduction = import.meta.env.PROD

  private write(level: LogLevel, ...args: unknown[]) {
    if (this.isProduction) {
      return
    }
    console[level]("[DEBUG]", ...args)
  }

  log(...args: unknown[]) {
    this.write("log", ...args)
  }

  debug(...args: unknown[]) {
    this.write("debug", ...args)
  }

  info(...args: unknown[]) {
    this.write("info", ...args)
  }

  warn(...args: unknown[]) {
    this.write("warn", ...args)
  }

  error(...args: unknown[]) {
    this.write("error", ...args)
  }
}

export const debugLogger = new DebugLogger()
