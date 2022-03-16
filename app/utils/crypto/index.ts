export type CryptoAccountData = {
  username: string
  password: string
  phone: string
  emailRecovery: string
  response: null
  uris: {
    match: null
    response: null
    uri: string
  }
  notes: string
}

export type CryptoWalletData = {
  email: string
  seed: string
  notes: string
  network: {
    name: string
    alias: string
  }
}

export const toCryptoAccountData = (str: string) => {
  let res: CryptoAccountData = {
    username: '',
    password: '',
    phone: '',
    emailRecovery: '',
    response: null,
    uris: {
      match: null,
      response: null,
      uri: ''
    },
    notes: ''
  }
  try {
    const parsed: CryptoAccountData = JSON.parse(str)
    res = {
      ...res,
      ...parsed
    }
  } catch (e) {
  }
  return res
}

export const toCryptoWalletData = (str: string) => {
  let res: CryptoWalletData = {
    email: '',
    seed: '',
    notes: '',
    network: {
      name: '',
      alias: ''
    }
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
