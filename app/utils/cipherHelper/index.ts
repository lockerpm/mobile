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
      return VAULT_LOGO.cards

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
