export type CryptoWalletData = {
  walletApp: {
    name: string
    alias: string
  },
  username: string
  password: string
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
      alias: ""
    },
    username: "",
    password: "",
    address: "",
    privateKey: "",
    seed: "",
    networks: [],
    notes: ""
  }
  try {
    const parsed: CryptoWalletData = JSON.parse(str)
    res = {
      ...res,
      ...parsed
    }
  } catch (e) {
  }
  return res
}
