import extractDomain from "extract-domain"

import { useStores } from "app/models"
import { MasterPasswordPolicy, PasswordPolicy } from "app/static/types"
import { PolicyType } from "app/static/types/enum"
import { CipherType, FieldType, SecureNoteType } from "core/enums"
import {
  CardView,
  CipherView,
  IdentityView,
  LoginUriView,
  LoginView,
  SecureNoteView,
} from "core/models/view"

import Config from "@/config"
import { useAppLocale } from "@/i18n"

import { useCoreService } from "../coreService"

export function useCipherHelper() {
  const { translate } = useAppLocale()
  const { passwordGenerationService } = useCoreService()
  const { user, uiStore } = useStores()

  // ------------------ METHODS ---------------------------

  const newCipher = (type: CipherType) => {
    const cipher = new CipherView()
    // @ts-ignore
    cipher.organizationId = null
    cipher.type = type
    cipher.login = new LoginView()
    cipher.login.uris = [new LoginUriView()]
    cipher.card = new CardView()
    cipher.identity = new IdentityView()
    cipher.secureNote = new SecureNoteView()
    cipher.secureNote.type = SecureNoteType.Generic
    cipher.folderId = ""
    cipher.collectionIds = []
    return cipher
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

  // Password strength
  const getPasswordStrength = (password: string): { score: number } => {
    return passwordGenerationService.passwordStrength(password, ["cystack"]) || { score: 0 }
  }

  // Get custom field data from type
  const getCustomFieldDataFromType = (type: FieldType) => {
    const res = {
      type,
      label: translate("common:name"),
    }
    switch (type) {
      case FieldType.Text:
        res.label = translate("common:text")
        break
      case FieldType.Hidden:
        res.label = translate("common:password")
        break
      case FieldType.URL:
        res.label = "URL"
        break
      case FieldType.Email:
        res.label = "Email"
        break
      case FieldType.Address:
        res.label = translate("common:address")
        break
      case FieldType.Date:
        res.label = translate("common:date")
        break
      case FieldType.MonthYear:
        res.label = translate("common:month_year")
        break
      case FieldType.Phone:
        res.label = translate("common:phone")
        break
      case FieldType.TOTP:
        res.label = "OTP"
        break
    }
    return res
  }

  return {
    newCipher,
    getPasswordStrength,
    getCustomFieldDataFromType,
    getWebsiteLogo,
  }
}
