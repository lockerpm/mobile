import { observer } from 'mobx-react-lite'
import React, { createContext, useContext } from 'react'
import { useMixins } from '..'
import { CipherType } from '../../../../core/enums'
import { CipherView } from '../../../../core/models/view'
import { PlanType } from '../../../config/types'
import { useStores } from '../../../models'
import { Logger } from '../../../utils/logger'
import { useCoreService } from '../../core-service'
import { useCipherDataMixins } from './data'


const defaultData = {
  loadPasswordsHealth: async () => {},
  getCipherCount: async (type: CipherType):Promise<number> => {return 0}
}

export const CipherToolsMixinsContext = createContext(defaultData)

export const CipherToolsMixinsProvider = observer((props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {
  const { user, toolStore } = useStores()
  const { getCiphers } = useCipherDataMixins()
  const {
    passwordGenerationService,
    auditService
  } = useCoreService()
  const { translate, notify } = useMixins()
  
  // ----------------------------- METHODS ---------------------------
  const getCipherCount =async (type: CipherType) => {
    const allCiphers = await getCiphers({
      deleted: false,
      searchText: '',
      filters: [
        (c: CipherView) => c.type === type
      ]
    })
    return allCiphers.length
  }

  // Load weak passwords
  const loadPasswordsHealth = async () => {
    try {
      if (!user.plan || user.plan?.alias === PlanType.FREE) {
        return
      }
  
      const passwordStrengthCache = new Map()
      const passwordStrengthMap = new Map()
      const passwordUseMap = new Map()
      const exposedPasswordMap = new Map()
  
      const exposedPasswordCiphers = []
      const promises = []
  
      const allCiphers = await getCiphers({
        deleted: false,
        searchText: '',
        filters: [(c: CipherView) => c.type === CipherType.Login && c.login.password]
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
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
    }
  }
  
  // -------------------- REGISTER FUNCTIONS ------------------

  const data = {
    loadPasswordsHealth,
    getCipherCount
  }

  return (
    <CipherToolsMixinsContext.Provider value={data}>
      {props.children}
    </CipherToolsMixinsContext.Provider>
  )
})

export const useCipherToolsMixins = () => useContext(CipherToolsMixinsContext)
