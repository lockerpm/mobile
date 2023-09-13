/* eslint-disable @typescript-eslint/no-unused-vars */
import { useStores } from "app/models"
import { useCoreService } from "../core-service"
import { useHelper } from "./useHelper"
import { useCipherData } from "./useCipherData"
import { CipherView } from "core/models/view"
import { CipherType } from "core/enums"
import { translate } from "app/i18n"
import { Logger } from "app/utils/utils"



export function useTool() {
  const { user, toolStore, cipherStore } = useStores()
  const {
    passwordGenerationService,
    auditService
  } = useCoreService()

  const { getCiphers, getEncryptedCiphers } = useCipherData()
  const { notify } = useHelper()


  // ----------------------------- METHODS ---------------------------

  const checkLoginIdExist = async (id: string) => {
    const allLogins = await getEncryptedCiphers({
      deleted: false,
      searchText: '',
      filters: [
        (c: CipherView) => c.type === CipherType.Login
      ]
    })
    const res = allLogins.some(e => e.id === id)
    return res
  }

  const getCipherCount = async (type: CipherType, deleted?: boolean, share?: boolean) => {
    let searchConfig = {
      deleted: false,
      searchText: '',
      filters: [
        (c: CipherView) => c.type === type
      ]
    }
    if (deleted) {
      searchConfig = {
        deleted: true,
        searchText: '',
        filters: []
      }
    }
    if (share) {
      searchConfig = {
        deleted: false,
        searchText: '',
        filters: [
          (c: CipherView) => c.organizationId !== null
        ]
      }
    }
    const allCiphers = await getEncryptedCiphers(searchConfig)
    return allCiphers.length
  }

  // Load weak passwords
  const loadPasswordsHealth = async () => {
    try {
      if (user.isFreePlan) {
        return
      }


      if (cipherStore.isSynching || cipherStore.isBatchDecrypting) {
        toolStore.setDataLoading(true)
        return
      }

      toolStore.setDataLoading(false)
      toolStore.setLoadingHealth(true)
      toolStore.setLastHealthCheck()

      const passwordStrengthCache = new Map()
      const passwordStrengthMap = new Map()
      const passwordUseMap = new Map()
      const exposedPasswordMap = new Map()

      const exposedPasswordCiphers = []
      const promises = []

      const allCiphers = await getCiphers({
        deleted: false,
        searchText: '',
        filters: [(c: CipherView) => c.type === CipherType.Login && !!c.login.password]
      })
      const weakPasswordCiphers = []
      const isUserNameNotEmpty = (c: CipherView) => {
        return c.login.username != null && c.login.username.trim() !== ''
      }
      const getCacheKey = (c: CipherView) => {
        return c.login.password + '_____' + (isUserNameNotEmpty(c) ? c.login.username : '')
      }

      allCiphers.forEach((c: CipherView) => {
        const hasUserName = isUserNameNotEmpty(c)
        const cacheKey = getCacheKey(c)

        // Check password used
        if (passwordUseMap.has(c.login.password)) {
          passwordUseMap.set(c.login.password, passwordUseMap.get(c.login.password) + 1)
        } else {
          passwordUseMap.set(c.login.password, 1)
        }

        // Check password strength
        if (!passwordStrengthCache.has(cacheKey)) {
          // Compare password with username as well
          let userInput = []
          if (hasUserName) {
            const atPosition = c.login.username.indexOf('@')
            if (atPosition > -1) {
              userInput = userInput.concat(
                c.login.username.substr(0, atPosition).trim().toLowerCase().split(/[^A-Za-z0-9]/)
              ).filter(i => i.length >= 3)
            } else {
              userInput = c.login.username.trim().toLowerCase().split(/[^A-Za-z0-9]/).filter(i => i.length >= 3)
            }
          }
          const result = passwordGenerationService.passwordStrength(
            c.login.password,
            // TODO: disable for now
            // userInput.length > 0 ? userInput : null
          )
          passwordStrengthCache.set(cacheKey, result.score)
        }
        const score = passwordStrengthCache.get(cacheKey)
        if (score != null && score <= 2) {
          passwordStrengthMap.set(c.id, score)
          weakPasswordCiphers.push(c)
        }

        // Check exposed password
        const promise = auditService.passwordLeaked(c.login.password).then(exposedCount => {
          if (exposedCount > 0) {
            exposedPasswordCiphers.push(c)
            exposedPasswordMap.set(c.id, exposedCount)
          }
        })
        promises.push(promise)
      })

      await Promise.all(promises)

      // Result
      weakPasswordCiphers.sort((a, b) => {
        return passwordStrengthCache.get(getCacheKey(a)) - passwordStrengthCache.get(getCacheKey(b))
      })
      const reusedPasswordCiphers = allCiphers.filter((c: CipherView) => (
        passwordUseMap.has(c.login.password) && passwordUseMap.get(c.login.password) > 1
      ))

      toolStore.setWeakPasswords(weakPasswordCiphers)
      toolStore.setPasswordStrengthMap(passwordStrengthMap)
      toolStore.setReusedPasswords(reusedPasswordCiphers)
      toolStore.setPasswordUseMap(passwordUseMap)
      toolStore.setExposedPasswords(exposedPasswordCiphers)
      toolStore.setExposedPasswordMap(exposedPasswordMap)
      toolStore.setLoadingHealth(false)
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error('loadPasswordsHealth: ' + e)
      toolStore.setLoadingHealth(false)
    }
  }


  return {
    checkLoginIdExist,
    loadPasswordsHealth,
    getCipherCount,
  }
}