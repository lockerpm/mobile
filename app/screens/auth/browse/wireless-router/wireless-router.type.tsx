export type WirelessRouterData = {
  deviceName: string,
  ipAddress: string
  adminUsername: string
  adminPassword: string
  wifiSSID: string
  wifiPassword: string
}

export const toWirelessRouterData = (str: string) => {
  let res: WirelessRouterData = {
    deviceName: "",
    ipAddress: "",
    adminUsername: "",
    adminPassword: "",
    wifiSSID: "",
    wifiPassword: ""
  }
  try {
    const parsed: WirelessRouterData = JSON.parse(str)
    res = {
      ...res,
      ...parsed
    }
  } catch (e) {
  }
  return res
}
