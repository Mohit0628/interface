import contractsData from "../contracts.json" with { type: "json" }

export type ContractAddresses = {
  // ── Core trading contracts ─────────────────────────────────────────────────
  exchangeRouter: string
  syntheticsReader: string
  dataStore: string
  marketFactory: string
  depositHandler: string
  withdrawalHandler: string
  orderVault: string
  referralStorage: string
  faucet: string
  tokens: {
    tusdc: string
    twbtc: string
    teth: string
    txlm: string
  }
  marketTokens: {
    twbtcTusdc: string
    tethTusdc: string
    txlmTusdc: string
  }
  // ── Infrastructure contracts used by Reader view functions ────────────────
  oracle: string
  orderHandler: string
  // ── Optional — empty string when not deployed ─────────────────────────────
  stakingRouter: string
  glvRouter: string
  vestingRouter: string
}

export type SupportedNetwork = "testnet" | "mainnet"

export const CONTRACT_DEPLOYMENTS: Record<SupportedNetwork, ContractAddresses> = contractsData.networks as Record<
  SupportedNetwork,
  ContractAddresses
>

export function getContractAddresses(network: string): ContractAddresses {
  const addresses = CONTRACT_DEPLOYMENTS[network as SupportedNetwork]
  if (!addresses) {
    throw new Error(`Unknown network "${network}" in contracts.json`)
  }
  return addresses
}
