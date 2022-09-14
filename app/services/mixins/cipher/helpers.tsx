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
import { toCryptoWalletData } from '../../../utils/crypto'
import { WALLET_APP_LIST } from '../../../utils/crypto/applist'
import { useCoreService } from '../../core-service'

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
