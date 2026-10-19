# SO4 Market

**On-chain perpetual markets, settled on Stellar.**

SO4 is a unified-liquidity perpetuals DEX built on Stellar/Soroban. Deep order books, sub-second matching, and self-custodied risk — built for traders who care where their fills come from.

---

## Screenshots

| Landing | Trade |
|---|---|
| ![Landing page](./screenshots/landing.png) | ![Trade page](./screenshots/trade.png) |

| Earn | Referrals |
|---|---|
| ![Earn page](./screenshots/earn.png) | ![Referrals page](./screenshots/referrals.png) |

---

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Testing Guide](#testing-guide)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing) — see also [`CONTRIBUTING.md`](./CONTRIBUTING.md) and [`AGENTS.md`](./AGENTS.md)
- [Changelog](#changelog)
- [License](#license)

---

## Overview

SO4 Market is the front-end interface for the SO4 perpetuals protocol. It connects to Stellar Soroban smart contracts (ExchangeRouter, DataStore, SyntheticsReader) and streams live prices from the SO4 oracle (primary) with Pyth, Binance, and GMX as fallbacks.

> **Status:** Active development on Stellar testnet. The interface builds, signs, and submits real Soroban transactions to the deployed testnet contracts (ExchangeRouter, DataStore, SyntheticsReader) and streams live prices through the SO4 oracle with Pyth, Binance, and GMX fallbacks. The OrderVault client is stubbed pending integration; staking, GLV, and vesting contracts are not deployed on testnet.

---

## Features

| Area | Details |
|---|---|
| **Trade** | Long / Short / Swap with Market, Limit, and Trigger order types |
| **Chart** | Candlestick chart (lightweight-charts v5), live price updates, position entry & liquidation price lines, dark/light theme |
| **Positions** | Real-time positions, orders, trades, and claims tabs |
| **Earn** | Portfolio overview, pool discovery, additional opportunities, reward distributions |
| **Referrals** | Trader discount codes, affiliate tiers, commission distributions |
| **Landing** | Live market ticker, order book preview, protocol stats |
| **Theme** | Full dark / light mode with zero flash on load |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | [Turborepo](https://turbo.build) + [Bun](https://bun.sh) workspaces |
| Framework | [React 19](https://react.dev) + [Vite 7](https://vitejs.dev) |
| Routing | [TanStack Router v1](https://tanstack.com/router) |
| Server state | [TanStack Query v5](https://tanstack.com/query) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| UI components | [shadcn/ui](https://ui.shadcn.com) (via `packages/ui` workspace) |
| Charts | [lightweight-charts v5](https://tradingview.github.io/lightweight-charts/) |
| Notifications | Custom toast in `packages/ui` (`@workspace/ui/components/toast`) |
| Blockchain | [Stellar](https://stellar.org) / [Soroban](https://soroban.stellar.org) |
| Oracle | SO4 oracle (primary) · Pyth · Binance REST · GMX oracle (fallback) |
| Type safety | TypeScript 5.9 |

---

## Project Structure

```
so4-market/
├── apps/
│   └── web/                        # Main React/Vite application
│       ├── public/                 # Static assets (favicon, manifest, PWA icons)
│       ├── scripts/                # Build-time utilities
│       └── src/
│           ├── features/
│           │   ├── earn/           # Earn page — pools, portfolio, rewards
│           │   ├── referrals/      # Referrals — traders, affiliates, distributions
│           │   └── trade/          # Trade page — chart, order panel, positions
│           ├── routes/             # TanStack Router file-based routes
│           ├── styles/             # Global CSS (landing)
│           └── ui/                 # Shared UI — Navbar, ThemeProvider, landing sections
│
├── packages/
│   └── ui/                         # Shared component library (shadcn/ui)
│       └── src/
│           ├── components/         # Button, Input, Dialog, Tabs, Skeleton, …
│           ├── hooks/
│           ├── lib/
│           └── styles/
│               └── globals.css     # Tailwind base + CSS custom properties
│
├── turbo.json                      # Turborepo pipeline config
├── package.json                    # Root workspace manifest
├── tsconfig.json                   # Root TypeScript config
└── bun.lock
```

### Feature module layout

Each feature under `src/features/<name>/` follows the same convention:

```
<feature>/
├── components/     # React components (page + sub-components)
├── data/           # Static data / contract address constants
├── hooks/          # TanStack Query hooks (data fetching + mutations)
└── lib/            # Business logic, contract calls, type definitions
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| [Bun](https://bun.sh) | ≥ 1.3 |
| [Node.js](https://nodejs.org) | ≥ 20 |

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/SO4-Markets/interface.git
cd interface

# Install all workspace dependencies
bun install
```

### 2. Configure Environment

Copy the example environment file to `.env.local` for local development:

```bash
cp apps/web/.env.example apps/web/.env.local
```

> **Contract IDs:** All Soroban contract addresses are source-of-truth committed in `packages/contracts/contracts.json`. You do not need to configure any contract addresses in your environment variables.

### 3. (Optional) Run the SubQuery Indexer Locally

By default, the web app connects to Stellar testnet directly via Soroban RPC and falls back gracefully when the indexer is offline. If you wish to run the historical indexer locally:

```bash
# Generate types and build indexer
bun run --cwd apps/s03-indexer codegen
bun run --cwd apps/s03-indexer build

# Start the indexer stack (requires Docker)
bun run --cwd apps/s03-indexer start
```

Ensure `VITE_INDEXER_GRAPHQL_URL=http://localhost:3000` is enabled in `apps/web/.env.local` if using the local indexer.

### 4. Run the Development Server

```bash
# Start all packages in development mode
bun dev

# Or start only the web app
bun run --cwd apps/web dev
```

The application will be running at [http://localhost:3000](http://localhost:3000).

### 5. Building for Production

```bash
bun run build
```

Production assets are compiled by Turborepo and output to `apps/web/dist/`.

---

## Available Scripts

Run any of these from the **repository root**:

| Command | Description |
|---|---|
| `bun dev` | Start all packages in development mode |
| `bun run build` | Build all packages for production |
| `bun lint` | Lint all packages with ESLint |
| `bun format` | Format all files with Prettier |
| `bun typecheck` | Run TypeScript type checks across all packages |

## Testing Guide

From a clean checkout, install workspace dependencies once:

```bash
bun install --frozen-lockfile
```

Run every unit suite from the repository root:

```bash
bun run test          # all workspaces
bun run test:e2e      # Playwright
```

Or a single workspace:

```bash
bun run --cwd packages/contracts test
bun run --cwd packages/ui test
bun run --cwd apps/s03-indexer test
```

Generate the CI coverage reports locally with `bun run test:coverage`.
`packages/contracts` gates at 85% lines, 85% branches, 80% statements, and 65%
functions. Reports are written to each package's `coverage/` directory.

> **Note:** `apps/web` has an extensive suite under `src/**/*.test.tsx` that is
> not yet wired into `turbo test`. Run it directly with
> `bunx vitest run --cwd apps/web` — some suites are currently failing and are
> being fixed before the package is added to the CI test task.

The end-to-end suite uses Playwright. On a fresh machine, Playwright may need
browser binaries or OS-level system dependencies before `bun run test:e2e` can
launch browsers. If Playwright reports missing dependencies, install them with
the Playwright CLI through Bun:

```bash
bunx playwright install --with-deps
```

Web tests run with MSW enabled and `onUnhandledRequest: "error"`, so every
network request made by a test must have an explicit mock handler. Add shared
handlers in `apps/web/test/msw/handlers.ts` or test-specific handlers with
`server.use(...)`. Tests must not depend on real external network calls.

---

## Architecture

### Oracle / Price feeds

The SO4 oracle is the primary price source (`apps/web/src/features/trade/lib/oracle.ts`). If it is unavailable, prices fall back to Pyth Hermes, then Binance REST, then the GMX oracle. Live candle data for the chart is fetched from the Binance public REST API with a Pyth Benchmarks fallback. Sources are normalised into a shared `OhlcBar` type (oldest-first, prices as numbers, time in Unix seconds).

### Contract integration

The real Soroban transaction paths live in `apps/web/src/features/trade/lib/stellar.ts`, `apps/web/src/features/earn/lib/earn.ts`, and `apps/web/src/features/pools/lib/pool-transactions.ts`. Each builds a transaction through `apps/web/src/lib/contracts.ts` (for example `buildCreateOrderTransaction`, `buildCreateDepositTransaction`), prepares and signs it with the connected wallet via `apps/web/src/lib/soroban/tx-builder.ts`, then submits and polls it through `apps/web/src/lib/tx-builder.ts`. Account and market reads go through `SyntheticsReader` over Soroban RPC, falling back to contract-only data when the indexer is disabled (`apps/web/src/app/config/indexer.ts`).

The OrderVault client (`packages/contracts/src/clients/order-vault.ts`) is a stub awaiting integration. `StakingRouter`, the GLV router, and `VestingRouter` are not deployed on testnet and their features are disabled in `apps/web/.env.testnet`. Referral codes are served by `ReferralStorage` (`apps/web/src/features/referrals/`).

### Theme system

The theme provider writes `dark` or `light` as a class on `<html>`. A blocking inline script in `<head>` reads `localStorage` before first paint to prevent flash of wrong theme. The chart component uses a `MutationObserver` on `document.documentElement` to re-apply color options instantly when the class changes.

---

## Troubleshooting

### `Missing env var: VITE_*`

If the web app fails to start or pages crash with `Missing env var: VITE_<NAME>`:

1. **Verify `.env.local` existence:** Vite in development mode automatically loads `apps/web/.env.local`. Create it by copying the template:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```
2. **Required variables:** Only the core network variables are required by `apps/web/src/app/config/env.ts`:
   - `VITE_NETWORK` (e.g. `testnet`)
   - `VITE_RPC_URL` (e.g. `https://soroban-testnet.stellar.org`)
   - `VITE_HORIZON_URL` (e.g. `https://horizon-testnet.stellar.org`)
3. **Contract addresses:** Contract IDs are committed directly in `packages/contracts/contracts.json` and resolved via `@workspace/contracts`. Do not define `VITE_CONTRACT_*` in your `.env` files.

---

## Contributing

Contributions are welcome. **Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before
opening a pull request** — it covers setup, the quality gate every change must
pass, commit conventions, and the project-specific gotchas that cause most CI
failures.

The short version: before you commit, all of these must pass from the repo root.

```bash
bun lint
bun typecheck
bun run check:tokens
bun run test
bun run test:coverage
bun run build
```

Never disable a check, skip a test, or lower a threshold to make the pipeline
green — fix the underlying cause instead.

### Using an AI coding agent?

[`AGENTS.md`](./AGENTS.md) is the binding operating contract for AI agents in
this repository, enforcing the same gate. Point your tool at it.
([`CLAUDE.md`](./CLAUDE.md) forwards to it for Claude Code.)

### Reporting issues

Open an issue on GitHub with a clear title, steps to reproduce, expected vs
actual behaviour, and the failing command's output. For suspected security
vulnerabilities, contact the maintainers privately instead of filing publicly
— see [`SECURITY.md`](./SECURITY.md).

---

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for a full history of releases and features.

---

## License

```
MIT License

Copyright (c) 2026 so4 labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  Built by <a href="https://so4.market">so4 labs</a> ·
  <a href="https://twitter.com/so4market">@so4market</a>
</p>
