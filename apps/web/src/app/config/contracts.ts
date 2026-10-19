/**
 * apps/web/src/app/config/contracts.ts
 *
 * All Soroban contract addresses in one place, keyed by role.
 * Sourced directly from packages/contracts/contracts.json via @workspace/contracts.
 *
 * Rule: feature code MUST import addresses from CONTRACTS, never
 * directly from ENV or import.meta.env.
 *
 * Optional contracts (stakingRouter, glvRouter, vestingRouter) will be
 * an empty string when not yet deployed.  Code that uses them must guard:
 *   if (!CONTRACTS.stakingRouter) throw new Error("Staking not deployed")
 */

import { getContractAddresses } from "@workspace/contracts"
import { ENV } from "./env"
import type { ContractAddresses } from "@workspace/contracts"

export type { ContractAddresses }

export const CONTRACTS: ContractAddresses = getContractAddresses(ENV.NETWORK)

