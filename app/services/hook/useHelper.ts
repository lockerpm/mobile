import { useCoreService } from "../coreService"
import { nanoid } from "nanoid"
import { useStores } from "app/models"
import { MASTER_PW_MIN_LENGTH } from "app/static/constants"
import { useAppLocale } from "@/i18n"

export function useHelper() {
  const { user, cipherStore, collectionStore, folderStore, toolStore, enterpriseStore } =
    useStores()
  const { translate } = useAppLocale()
  const { userService } = useCoreService()

  // Random string
  const randomString = (size?: number) => {
    return nanoid(size)
  }

  // Set tokens
  const setApiTokens = (token: string) => {
    user.setApiToken(token)
    cipherStore.setApiToken(token)
    collectionStore.setApiToken(token)
    folderStore.setApiToken(token)
    toolStore.setApiToken(token)
    enterpriseStore.setApiToken(token)
  }

  // Get all org
  const getAllOrganizations = () => {
    return userService.getAllOrganizations()
  }

  // Validate master password
  const validateMasterPassword = (password: string) => {
    let isValid = true
    let error = ""

    if (password.length && password.length < MASTER_PW_MIN_LENGTH) {
      isValid = false
      error = translate("policy:min_password_length", { length: MASTER_PW_MIN_LENGTH })
    }

    return {
      isValid,
      error,
    }
  }

  return {
    setApiTokens,
    randomString,
    getAllOrganizations,
    validateMasterPassword,
  }
}
