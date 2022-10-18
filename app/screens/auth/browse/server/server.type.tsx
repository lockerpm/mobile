export type ServerData = {
  host: string,
  publicKey: string
  privateKey: string
  username: string
  password: string
  notes: string
}

export const toServerData = (str: string) => {
  let res: ServerData = {
    host: "",
    publicKey: "",
    privateKey: "",
    username: "",
    password: "",
    notes: "",
  }
  try {
    const parsed: ServerData = JSON.parse(str)
    res = {
      ...res,
      ...parsed
    }
  } catch (e) {
  }
  return res
}
