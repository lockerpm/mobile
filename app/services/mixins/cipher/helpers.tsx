import { observer } from 'mobx-react-lite'
import React, { createContext, useContext } from 'react'
import { useMixins } from '..'
import { CipherType, FieldType, SecureNoteType } from '../../../../core/enums'
import {
  CardView,
  CipherView,
  IdentityView,
  LoginUriView,
  LoginView,
  SecureNoteView,
} from '../../../../core/models/view'
import { BROWSE_ITEMS } from '../../../common/mappings'
import { PolicyType } from '../../../config/types'
import { MasterPasswordPolicy, PasswordPolicy } from '../../../config/types/api'
import { useStores } from '../../../models'
import { toApiCipherData } from '../../../screens/auth/browse/api-cipher/api-cipher.type'
import { toCitizenIdData } from '../../../screens/auth/browse/citizen-id/citizen-id.type'
import { toDatabaseData } from '../../../screens/auth/browse/database/database.typs'
import { toDriverLicenseData } from '../../../screens/auth/browse/driver-license/driver-license.type'
import { toPassportData } from '../../../screens/auth/browse/passport/passport.type'
import { toServerData } from '../../../screens/auth/browse/server/server.type'
import { toSocialSecurityNumberData } from '../../../screens/auth/browse/social-security-number/social-security-number.type'
import { toWirelessRouterData } from '../../../screens/auth/browse/wireless-router/wireless-router.type'
import { toCryptoWalletData } from '../../../utils/crypto'
import { WALLET_APP_LIST } from '../../../utils/crypto/applist'
import { useCoreService } from '../../coreService'

const defaultData = {
  newCipher: (type: CipherType) => {
    return new CipherView()
  },
  getPasswordStrength: (password: string) => ({ score: 0 }),
  getCipherDescription: (cipher: CipherView) => '',
  getCipherInfo: (cipher: CipherView) => ({} as { svg?: any; img: any; backup: any; path: string }),
  getCustomFieldDataFromType: (type: FieldType) => ({ type: FieldType.Text, label: '' }),
  checkPasswordPolicy: async (password: string, policyType: PolicyType = PolicyType.PASSWORD_REQ) =>
    [] as string[],
}

export const CipherHelpersMixinsContext = createContext(defaultData)

export const CipherHelpersMixinsProvider = observer(
  (props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {
    const { passwordGenerationService } = useCoreService()
    const { getWebsiteLogo, translate } = useMixins()
    const { user, uiStore } = useStores()

    // ------------------ METHODS ---------------------------

    const newCipher = (type: CipherType) => {
      const cipher = new CipherView()
      cipher.organizationId = null
      cipher.type = type
      cipher.login = new LoginView()
      cipher.login.uris = [new LoginUriView()]
      cipher.card = new CardView()
      cipher.identity = new IdentityView()
      cipher.secureNote = new SecureNoteView()
      cipher.secureNote.type = SecureNoteType.Generic
      cipher.folderId = null
      cipher.collectionIds = []
      return cipher
    }

    // Password strength
    const getPasswordStrength = (password: string) => {
      return passwordGenerationService.passwordStrength(password, ['cystack']) || { score: 0 }
    }

    // Get cipher description
    const getCipherDescription = (item: CipherView) => {
      switch (item.type) {
        case CipherType.MasterPassword:
        case CipherType.Login:
          return item.login.username
        case CipherType.Card:
          return item.card.brand && item.card.number
            ? `${item.card.brand}, *${item.card.number.slice(-4)}`
            : ''
        case CipherType.Identity:
          return item.identity.fullName
        case CipherType.CryptoWallet: {
          const walletData = toCryptoWalletData(item.notes)
          return `${walletData.username}${walletData.username ? ', ' : ''}${
            walletData.networks.length
          } networks`
        }
        case CipherType.DriverLicense: {
          const driverLicenseData = toDriverLicenseData(item.notes)
          return driverLicenseData.fullName
        }
        case CipherType.CitizenID: {
          const citizenIDData = toCitizenIdData(item.notes)
          return citizenIDData.fullName
        }
        case CipherType.Passport: {
          const passportData = toPassportData(item.notes)
          return passportData.fullName
        }
        case CipherType.SocialSecurityNumber: {
          const socialSecurityNumberData = toSocialSecurityNumberData(item.notes)
          return socialSecurityNumberData.fullName
        }
        case CipherType.WirelessRouter: {
          const wirelessData = toWirelessRouterData(item.notes)
          return wirelessData.deviceName
        }
        case CipherType.Server: {
          const serverData = toServerData(item.notes)
          return serverData.host
        }
        case CipherType.APICipher: {
          const apiData = toApiCipherData(item.notes)
          return apiData.url
        }
        case CipherType.Database: {
          const databaseData = toDatabaseData(item.notes)
          return databaseData.host
        }
      }
      return ''
    }

    // Get cipher logo
    const getCipherInfo = (item: CipherView) => {
      switch (item.type) {
        case CipherType.MasterPassword:
        case CipherType.Login:
          return {
            img: item.login.uri ? getWebsiteLogo(item.login.uri) : BROWSE_ITEMS.password.icon,
            backup: BROWSE_ITEMS.password.icon,
            path: 'passwords',
          }
        case CipherType.Card:
          return {
            img: BROWSE_ITEMS.card.icon,
            backup: BROWSE_ITEMS.card.icon,
            path: 'cards',
          }
        case CipherType.Identity:
          return {
            img: BROWSE_ITEMS.identity.icon,
            backup: BROWSE_ITEMS.identity.icon,
            svg: BROWSE_ITEMS.identity.svgIcon,
            path: 'identities',
          }
        case CipherType.SecureNote:
          return {
            img: BROWSE_ITEMS.note.icon,
            backup: BROWSE_ITEMS.note.icon,
            svg: BROWSE_ITEMS.note.svgIcon,
            path: 'notes',
          }
        case CipherType.CryptoWallet: {
          const walletData = toCryptoWalletData(item.notes)
          const selectedApp = WALLET_APP_LIST.find((a) => a.alias === walletData.walletApp.alias)
          const otherApp = WALLET_APP_LIST.find((a) => a.alias === 'other')
          return {
            img: walletData.walletApp.alias
              ? selectedApp?.logo || otherApp.logo
              : BROWSE_ITEMS.cryptoWallet.icon,
            backup: BROWSE_ITEMS.cryptoWallet.icon,
            // svg: BROWSE_ITEMS.cryptoWallet.svgIcon,
            path: 'cryptoWallets',
          }
        }
        case CipherType.DriverLicense:
          return {
            img: BROWSE_ITEMS.driverLicense.icon,
            backup: BROWSE_ITEMS.driverLicense.icon,
            svg: BROWSE_ITEMS.driverLicense.svgIcon,
            path: 'driverLicenses',
          }
        case CipherType.CitizenID:
          return {
            img: BROWSE_ITEMS.citizenID.icon,
            backup: BROWSE_ITEMS.citizenID.icon,
            svg: BROWSE_ITEMS.citizenID.svgIcon,
            path: 'citizenIDs',
          }
        case CipherType.Passport:
          return {
            img: BROWSE_ITEMS.passport.icon,
            backup: BROWSE_ITEMS.passport.icon,
            svg: BROWSE_ITEMS.passport.svgIcon,
            path: 'passports',
          }
        case CipherType.SocialSecurityNumber:
          return {
            img: BROWSE_ITEMS.socialSecurityNumber.icon,
            backup: BROWSE_ITEMS.socialSecurityNumber.icon,
            svg: BROWSE_ITEMS.socialSecurityNumber.svgIcon,
            path: 'socialSecurityNumbers',
          }
        case CipherType.WirelessRouter:
          return {
            img: BROWSE_ITEMS.wirelessRouter.icon,
            backup: BROWSE_ITEMS.wirelessRouter.icon,
            svg: BROWSE_ITEMS.wirelessRouter.svgIcon,
            path: 'wirelessRouters',
          }
        case CipherType.Server:
          return {
            img: BROWSE_ITEMS.server.icon,
            backup: BROWSE_ITEMS.server.icon,
            svg: BROWSE_ITEMS.server.svgIcon,
            path: 'servers',
          }
        case CipherType.APICipher:
          return {
            img: BROWSE_ITEMS.apiCipher.icon,
            backup: BROWSE_ITEMS.apiCipher.icon,
            svg: BROWSE_ITEMS.apiCipher.svgIcon,
            path: 'apiCiphers',
          }
        case CipherType.Database:
          return {
            img: BROWSE_ITEMS.database.icon,
            backup: BROWSE_ITEMS.database.icon,
            svg: BROWSE_ITEMS.database.svgIcon,
            path: 'databases',
          }
        default:
          return {
            img: BROWSE_ITEMS.password.icon,
            backup: BROWSE_ITEMS.password.icon,
            path: 'passwords',
          }
      }
    }

    // Get custom field data from type
    const getCustomFieldDataFromType = (type: FieldType) => {
      const res = {
        type,
        label: translate('common.name'),
      }
      switch (type) {
        case FieldType.Text:
          res.label = translate('common.text')
          break
        case FieldType.Hidden:
          res.label = translate('common.password')
          break
        case FieldType.URL:
          res.label = 'URL'
          break
        case FieldType.Email:
          res.label = 'Email'
          break
        case FieldType.Address:
          res.label = translate('common.address')
          break
        case FieldType.Date:
          res.label = translate('common.date')
          break
        case FieldType.MonthYear:
          res.label = translate('common.month_year')
          break
        case FieldType.Phone:
          res.label = translate('common.phone')
          break
      }
      return res
    }

    // Check password policy
    const checkPasswordPolicy = async (
      password: string,
      policyType: PolicyType = PolicyType.PASSWORD_REQ
    ) => {
      const violations = []
      if (!user.teams.length || uiStore.isOffline) {
        return violations
      }
      const res = await user.getTeamPolicy(user.teams[0].id, policyType)
      if (res.kind !== 'ok') {
        return violations
      }
      const policy = (() => {
        if (policyType === PolicyType.MASTER_PASSWORD_REQ) {
          return res.data as MasterPasswordPolicy
        }
        return res.data as PasswordPolicy
      })()
      if (policy && policy.enabled) {
        if (policy.config.min_length && password.length < policy.config.min_length) {
          violations.push(
            translate('policy.min_password_length', { length: policy.config.min_length })
          )
        }
        if (policy.config.require_special_character) {
          const reg = /(?=.*[!@#$%^&*])/
          const check = reg.test(password)
          if (!check) {
            violations.push(translate('policy.requires_special'))
          }
        }
        if (policy.config.require_lower_case) {
          const reg = /[a-z]/
          const check = reg.test(password)
          if (!check) {
            violations.push(translate('policy.requires_lowercase'))
          }
        }
        if (policy.config.require_upper_case) {
          const reg = /[A-Z]/
          const check = reg.test(password)
          if (!check) {
            violations.push(translate('policy.requires_uppercase'))
          }
        }
        if (policy.config.require_digit) {
          const reg = /[1-9]/
          const check = reg.test(password)
          if (!check) {
            violations.push(translate('policy.requires_number'))
          }
        }
      }
      return violations
    }

    // -------------------- REGISTER FUNCTIONS ------------------

    const data = {
      newCipher,
      getPasswordStrength,
      getCipherDescription,
      getCipherInfo,
      getCustomFieldDataFromType,
      checkPasswordPolicy,
    }

    return (
      <CipherHelpersMixinsContext.Provider value={data}>
        {props.children}
      </CipherHelpersMixinsContext.Provider>
    )
  }
)

export const useCipherHelpersMixins = () => useContext(CipherHelpersMixinsContext)
