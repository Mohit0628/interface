import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { CONTRACT_DEPLOYMENTS, getContractAddresses } from "@workspace/contracts"
import { CONTRACTS } from "./contracts"

describe("Contract addresses resolution (#860)", () => {
  it("resolves all required contracts for testnet", () => {
    const contracts = getContractAddresses("testnet")
    assert.ok(contracts.exchangeRouter, "exchangeRouter must be defined")
    assert.ok(contracts.syntheticsReader, "syntheticsReader must be defined")
    assert.ok(contracts.dataStore, "dataStore must be defined")
    assert.ok(contracts.marketFactory, "marketFactory must be defined")
    assert.ok(contracts.depositHandler, "depositHandler must be defined")
    assert.ok(contracts.withdrawalHandler, "withdrawalHandler must be defined")
    assert.ok(contracts.orderVault, "orderVault must be defined")
    assert.ok(contracts.referralStorage, "referralStorage must be defined")
    assert.ok(contracts.oracle, "oracle must be defined")
    assert.ok(contracts.orderHandler, "orderHandler must be defined")
    assert.ok(contracts.faucet, "faucet must be defined")
    assert.ok(contracts.tokens.tusdc, "tokens.tusdc must be defined")
    assert.ok(contracts.tokens.twbtc, "tokens.twbtc must be defined")
    assert.ok(contracts.tokens.teth, "tokens.teth must be defined")
    assert.ok(contracts.tokens.txlm, "tokens.txlm must be defined")
    assert.ok(contracts.marketTokens.twbtcTusdc, "marketTokens.twbtcTusdc must be defined")
    assert.ok(contracts.marketTokens.tethTusdc, "marketTokens.tethTusdc must be defined")
    assert.ok(contracts.marketTokens.txlmTusdc, "marketTokens.txlmTusdc must be defined")
  })

  it("resolves contracts object for mainnet", () => {
    const contracts = getContractAddresses("mainnet")
    assert.ok(contracts, "mainnet contracts object must exist")
    assert.equal(typeof contracts.exchangeRouter, "string")
    assert.equal(typeof contracts.syntheticsReader, "string")
    assert.equal(typeof contracts.dataStore, "string")
  })

  it("throws error for unknown network", () => {
    assert.throws(
      () => getContractAddresses("unknown"),
      /Unknown network "unknown" in contracts\.json/,
    )
  })

  it("exports active CONTRACTS matching testnet deployment", () => {
    assert.equal(CONTRACTS.exchangeRouter, CONTRACT_DEPLOYMENTS.testnet.exchangeRouter)
    assert.equal(CONTRACTS.syntheticsReader, CONTRACT_DEPLOYMENTS.testnet.syntheticsReader)
    assert.equal(CONTRACTS.dataStore, CONTRACT_DEPLOYMENTS.testnet.dataStore)
    assert.equal(CONTRACTS.tokens.tusdc, CONTRACT_DEPLOYMENTS.testnet.tokens.tusdc)
  })
})
