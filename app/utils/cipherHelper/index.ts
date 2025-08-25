import { CipherAppView } from "app/static/types"
import { CipherType } from "core/enums"
import { CipherView } from "core/models/view"
import { ImageSourcePropType } from "react-native"
import extractDomain from "extract-domain"
import { WALLET_APP_LIST } from "../crypto/applist"
import { VAULT_LOGO } from "app/static/vault"
import find from "lodash/find"
import { toCryptoWalletData } from "../crypto"
import Config from "@/config"
import { CARD_BRANDS } from "@/static/constants"

// Card detection logic
export const detectCardBrand = (cardNumber: string) => {
  if (!cardNumber) {
    return undefined
  }
  const number = cardNumber.replace(/\D/g, "")

  const cardPatterns = [
    { value: "Visa", regex: /^4\d{0,15}$/ },
    { value: "Mastercard", regex: /^(5[1-5]|2[2-7])\d{0,14}$/ },
    { value: "Amex", regex: /^3[47]\d{0,13}$/ },
    { value: "Discover", regex: /^6(?:011|5\d{2}|4[4-9])\d{0,12}$/ },
    { value: "Diners Club", regex: /^3(?:0[0-5]|[68])\d{0,11}$/ },
    { value: "JCB", regex: /^(?:2131|1800|35\d{0,3})\d{0,11}$/ },
    { value: "Maestro", regex: /^(?:5[06789]|6\d)\d{0,17}$/ },
    { value: "UnionPay", regex: /^62\d{0,17}$/ },
  ]

  for (const { value, regex } of cardPatterns) {
    if (regex.test(number)) {
      return CARD_BRANDS.find((b) => b.value === value)
    }
  }

  return undefined
}

// Get cipher description
export const getCipherDescription = (item: CipherView | CipherAppView) => {
  switch (item.type) {
    case CipherType.MasterPassword:
    case CipherType.Login:
      return item.login.username
    case CipherType.Card:
      return item.card.brand && item.card.number
        ? `${item.card.brand}, *${item.card.number.slice(-4)}`
        : ""
    case CipherType.Identity:
      return item.identity.fullName
    case CipherType.CryptoWallet: {
      const walletData = toCryptoWalletData(item.notes)
      return `${walletData.username}${walletData.username ? ", " : ""}${
        walletData.networks.length
      } networks`
    }
  }
  return ""
}

// Get website logo
const getWebsiteLogo = (uri: string) => {
  if (!uri || uri === "https://") {
    return { uri: null }
  }
  const domain = extractDomain(uri)
  if (!domain) {
    return { uri: null }
  }
  const imgUri = `${Config.GET_LOGO_URL}/${domain}?size=120`
  return { uri: imgUri }
}

// Get cipher logo
export const getCipherLogo: (item: CipherView | CipherAppView) => ImageSourcePropType = (
  item: CipherView | CipherAppView
) => {
  switch (item.type) {
    case CipherType.MasterPassword:
    case CipherType.Login: {
      const { uri } = getWebsiteLogo(item.login.uri)
      return uri ? { uri } : VAULT_LOGO.passwords
    }
    case CipherType.Card:
      const cardBrand = detectCardBrand(item.card.number)
      return cardBrand?.logo || VAULT_LOGO.cards

    case CipherType.Identity:
      return VAULT_LOGO.identities

    case CipherType.SecureNote:
      return VAULT_LOGO.notes
    case CipherType.CryptoWallet: {
      const walletData = toCryptoWalletData(item.notes)
      const selectedApp = WALLET_APP_LIST.find((a) => a.alias === walletData.walletApp.alias)
      const otherApp = WALLET_APP_LIST.find((a) => a.alias === "other")
      return walletData.walletApp.alias
        ? selectedApp?.logo || otherApp?.logo || VAULT_LOGO.cryptoWallets
        : VAULT_LOGO.cryptoWallets
    }
  }
  return item.login.uri ? getWebsiteLogo(item.login.uri) : VAULT_LOGO.passwords
}

// Get team
export const getTeam = (teams: any[], orgId: string | null) => {
  return find(teams, (e) => e.id === orgId) || { name: "", role: "", type: 0 }
}
