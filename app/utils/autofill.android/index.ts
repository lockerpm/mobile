import { NativeModules, Platform } from "react-native"

import { Fido2Utils } from "core/misc/fido2/fido2-utils"
import { guidToRawFormat } from "core/misc/fido2/guid-utils"
import { Fido2CredentialView } from "core/models/view/fido2CredentialView"

const { RNAutofillServiceIos, RNAutofillServiceAndroid } = NativeModules

export enum AndroidASType {
  FILL_PASSWORD = 1,
  QUICK_BAR_PASSWORD = 2,
  SAVE_PASSWORD = 3,
  CREATE_PASSKEY = 4,
  GET_PASSKEY = 5,
}

export type AndroidAFGetPasskey = {
  type: AndroidASType.GET_PASSKEY
  requestJson: string // JSON string of PublicKeyCredentialCreationOptionsJSON
  origin: string
  packageName: string
  clientDataHash?: string
}

export type AndroidAFCreatePasskey = {
  type: AndroidASType.CREATE_PASSKEY
  requestJson: string // JSON string of PublicKeyCredentialCreationOptionsJSON
  origin: string
  packageName: string
}

export type AndroidAFSavePassword = {
  type: AndroidASType.SAVE_PASSWORD
  url: string
  username: string
  password: string
}

export type AndroidAFFillPassword = {
  type: AndroidASType.FILL_PASSWORD
  url: string
}

export type AndroidAFQuickBarPassword = {
  type: AndroidASType.QUICK_BAR_PASSWORD
  id: string
}

export type AndroidAppProps =
  | AndroidAFFillPassword
  | AndroidAFQuickBarPassword
  | AndroidAFSavePassword
  | AndroidAFCreatePasskey
  | AndroidAFGetPasskey

export const isDeviceAutofillServiceEnabled = async () => {
  if (Platform.OS === "ios") {
    return RNAutofillServiceIos.isAutofillServiceActived()
  }
  return RNAutofillServiceAndroid.isAutofillServiceActived()
}

export const isChromeAutofillServiceEnabled = async () => {
  return RNAutofillServiceAndroid.isChromeAutofillServiceActived()
}

export const openChromeAutofillSettings = async () => {
  return RNAutofillServiceAndroid.openChromeAutofillSettings()
}

export const handleCreatePasskeyResponse = async (credentialId: string, publicKey: string) => {
  if (androidAutofillServiceData?.type === AndroidASType.CREATE_PASSKEY) {
    const { requestJson, origin, packageName } =
      androidAutofillServiceData as AndroidAFCreatePasskey

    const realCredentialID = Fido2Utils.bufferToString(guidToRawFormat(credentialId))
    RNAutofillServiceAndroid.handleCreatePasskeyResponse(
      requestJson,
      realCredentialID,
      publicKey,
      origin,
      packageName
    )
  }
}

export const handleGetPasskeyResponse = async (item: Fido2CredentialView) => {
  if (androidAutofillServiceData?.type === AndroidASType.GET_PASSKEY) {
    const { requestJson, origin, packageName, clientDataHash } =
      androidAutofillServiceData as AndroidAFGetPasskey

    const realCredentialID = Fido2Utils.bufferToString(guidToRawFormat(item.credentialId))
    await RNAutofillServiceAndroid.handleGetPasskeyResponse(
      requestJson,
      realCredentialID,
      item.userHandle,
      item.keyValue,
      0,
      origin,
      packageName,
      clientDataHash || ""
    )
  }
}

export const parseSearchText: (bundle: string) => string[] = (bundle) => {
  if (!bundle) return []
  const meaninglessSearch = ["com", "net", "app", "package", "www", "io", "org", "dev"]
  const words: string[] = bundle
    .trim()
    .split(".")
    .filter((word) => word.length >= 3 && !meaninglessSearch.includes(word))

  if (words.length === 0) return []

  const results: string[] = []
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j <= words.length; j++) {
      const subarray = words.slice(i, j).join(".")
      results.push(subarray)
    }
  }
  results.sort((a, b) => {
    return a.length > b.length ? -1 : 1
  })

  return results
}

export let androidAutofillServiceData: AndroidAppProps | null = null

// if app start from android autofill service. navigate to autofill screen
export const setAndroidAutofillServiceData = (props: AndroidAppProps | { type?: number }) => {
  if (isAndroidAutofillService(props)) {
    androidAutofillServiceData = props as AndroidAppProps
  }
}

export const isAndroidAutofillService = (payload?: AndroidAppProps | { type?: number }) => {
  return Platform.OS === "android" && payload?.type !== undefined
}
