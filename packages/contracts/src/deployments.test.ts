import { describe, expect, it } from "vitest"
import { CONTRACT_DEPLOYMENTS, getContractAddresses } from "./deployments"

describe("CONTRACT_DEPLOYMENTS (#860)", () => {
  it("defines contract deployments for testnet", () => {
    const testnet = CONTRACT_DEPLOYMENTS.testnet
    expect(testnet).toBeDefined()
    expect(testnet.exchangeRouter).toBe("CBD6BQSQFROWIIT5QCYN7KL5LJJWUIH7CEWUSZIFMUJO6NPXE6CVGYNW")
    expect(testnet.syntheticsReader).toBe("CC6OZUHF3LVO6PNP3V2EB36ORB3YSVYSH3LWD3RFLO4NUO3BYCXSWSYC")
    expect(testnet.dataStore).toBe("CCZ3VKBEDLNBO2JM3EXL3SNBDJOV5BTN52FVQPER7F6D5GCE53PITQ3J")
    expect(testnet.marketFactory).toBe("CBGX3EJFI3JRHSN5B533O2L5P57JFPTCRS55IPWFS5BNDXLJLXDWA5Z2")
    expect(testnet.depositHandler).toBe("CDWOFIP4YQJGMCYAOWLSRBAWN2OTJUG2I5WOFC32O2TX2SRU56RWBE5C")
    expect(testnet.withdrawalHandler).toBe("CBRWM6PNRRFL5RSTJH6HWEXBTMWCGLQRO45NTRDB6BBABWXZ4ZE7DGTO")
    expect(testnet.orderVault).toBe("CAXZRTYJHTAEEHDJ5WH4MVS2BGRCNNXLJ7BH356RULEZGEV2RKAG3QON")
    expect(testnet.referralStorage).toBe("CDHTPQO4RRJ6OUBIW3GDXTIVLVOMIKPJC65PGDJH2G5OLDJRE5KTROWK")
    expect(testnet.oracle).toBe("CBEMTV23SIJJBIST3V5HTMWHR4MHYGHNBIG4M26U4LGUJTWZXTFSVQEY")
    expect(testnet.orderHandler).toBe("CC35OFZVWUTAZPV3B6UKSDVAVORZEWUUMOMTHO33H4YR4C5FKPEFODKY")
    expect(testnet.faucet).toBe("CCWXXBKXHHP5DXC6TYVIL22XUNHD5A75O6WM5D2KM5PY45IOV5VDMARJ")
    expect(testnet.tokens.tusdc).toBe("CBAN5YU3KRDKPTQ2H76D6S7HQFPRBGUD524F65BUM2RQCITPTRLKWKES")
    expect(testnet.tokens.twbtc).toBe("CCFTOPHUPSUDO2MB4X5D3XYJ2HRJ7NJPAW4UVPAVN7ZLE63EZLSMXDUO")
    expect(testnet.tokens.teth).toBe("CAJ6BZKGFT47ALGMVFZZGAOXBV2RWIVYVCU4WJCQIURKRNXU346RWVAU")
    expect(testnet.tokens.txlm).toBe("CAHNXBBSXVMGI6G3FUBY3OTNWKQ7434FDDEEE7ZT733WIW6NUZL4ONU6")
    expect(testnet.marketTokens.twbtcTusdc).toBe("CDDVSLBGGDV2UOFN5W72R4LW7ABYL7H7ZWVSFHGMXXB3D52ZYANC5G3L")
    expect(testnet.marketTokens.tethTusdc).toBe("CCBUUSYZJTGVA6PYUNQDFPZFHTBZ2QSHOUO7YAGRQVA46T3ZLSIYULS4")
    expect(testnet.marketTokens.txlmTusdc).toBe("CDIBR7BDCDWGAG3CC6PBKRSLMISPYKNDGE57DCZO5TMTLZK34TMGKFQQ")
    expect(testnet.stakingRouter).toBe("")
    expect(testnet.glvRouter).toBe("")
    expect(testnet.vestingRouter).toBe("")
  })

  it("defines contract deployments structure for mainnet", () => {
    const mainnet = CONTRACT_DEPLOYMENTS.mainnet
    expect(mainnet).toBeDefined()
    expect(typeof mainnet.exchangeRouter).toBe("string")
    expect(typeof mainnet.syntheticsReader).toBe("string")
    expect(typeof mainnet.dataStore).toBe("string")
    expect(mainnet.tokens).toBeDefined()
    expect(mainnet.marketTokens).toBeDefined()
  })

  it("resolves addresses with getContractAddresses helper", () => {
    const addresses = getContractAddresses("testnet")
    expect(addresses.exchangeRouter).toBe(CONTRACT_DEPLOYMENTS.testnet.exchangeRouter)
  })

  it("throws error when unknown network is passed to getContractAddresses", () => {
    expect(() => getContractAddresses("unsupported-net")).toThrow(
      'Unknown network "unsupported-net" in contracts.json',
    )
  })
})
