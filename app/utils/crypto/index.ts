import { Logger } from "../logger"

export type CryptoWalletData = {
  walletApp: {
    name: string
    alias: string
  }
  username: string
  password: string
  pin: string
  address: string
  privateKey: string
  seed: string
  networks: {
    name: string
    alias: string
  }[]
  notes: string
}

export const toCryptoWalletData = (str: string) => {
  let res: CryptoWalletData = {
    walletApp: {
      name: "",
      alias: "",
    },
    username: "",
    password: "",
    pin: "",
    address: "",
    privateKey: "",
    seed: "",
    networks: [],
    notes: "",
  }
  if (str === "") {
    return res
  }
  try {
    const parsed: CryptoWalletData = JSON.parse(str)
    res = {
      ...res,
      ...parsed,
    }
  } catch (e) {
    Logger.error("toCryptoWalletData: Error parsing crypto wallet data", e)
  }
  return res
}
