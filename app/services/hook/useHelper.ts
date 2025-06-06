import { useCoreService } from "../coreService"
import find from "lodash/find"
import { nanoid } from "nanoid"
import { useStores } from "app/models"
import { load } from "app/utils/storage"
import { MASTER_PW_MIN_LENGTH } from "app/static/constants"
import { useAppLocale } from "../context"

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

  // Get current route name
  const getRouteName = async () => {
    const res = await load("NAVIGATION_STATE")
    let route = res.routes.slice(-1)[0]
    while (route.state && route.state.routes) {
      route = route.state.routes.slice(-1)[0]
    }
    return route.name
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
      error = translate("policy.min_password_length", { length: MASTER_PW_MIN_LENGTH })
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
    getRouteName,
    validateMasterPassword,
  }
}
