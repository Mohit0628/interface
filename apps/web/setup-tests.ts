import "./register-dom"
import "@testing-library/jest-dom/vitest"
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./test/msw/server";

afterEach(() => {
  cleanup();
});

// happy-dom defaults to about:blank which makes window.location.origin === "null"
// This breaks new URL("/", origin) in ConnectButton's WalletModal
window.location.href = "http://localhost:3000/";

// Start MSW with onUnhandledRequest:"error" so any fetch with no handler
// fails loudly instead of silently passing through to the real network.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Required env vars (vitest config normally injects these via define)
process.env.VITE_NETWORK = 'testnet';
process.env.VITE_RPC_URL = 'https://soroban-testnet.stellar.org';
process.env.VITE_HORIZON_URL = 'https://horizon-testnet.stellar.org';

