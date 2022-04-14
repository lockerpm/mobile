import React from 'react'
import { nanoid } from 'nanoid'
import find from 'lodash/find'
import ReactNativeBiometrics from 'react-native-biometrics'
import Toast from 'react-native-toast-message'
import { useStores } from '../../models'
import Clipboard from '@react-native-clipboard/clipboard'
import { load, PushNotiData, remove, StorageKey } from '../../utils/storage'
import { translate as tl, TxKeyPath } from "../../i18n"
import { GET_LOGO_URL } from '../../config/constants'
import i18n from "i18n-js"
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GeneralApiProblem } from '../api/api-problem'
import { observer } from 'mobx-react-lite'
import { color, colorDark } from '../../theme'
import extractDomain from 'extract-domain'
import { PushNotifier } from '../../utils/push-notification'
import { Logger } from '../../utils/logger'
import { useCoreService } from '../core-service'
import { NotifeeNotificationData, PushEvent } from '../../utils/push-notification/types'


const { createContext, useContext } = React

// Mixins data
const defaultData = {
  // Data
  color,
  isDark: false,

  // Methods
  setApiTokens: (token: string) => {},
  getWebsiteLogo: (uri: string) => ({ uri: '' }),
  getAllOrganizations: async () => [],
  getTeam: (teams: object[], orgId: string) => ({ name: '', role: '', type: 0 }),
  copyToClipboard: (text: string) => {},
  getRouteName: async () => { return '' },
  isBiometricAvailable: async () => { return false },
  translate: (tx: TxKeyPath, options?: i18n.TranslateOptions) => { return '' },
  notifyApiError: (problem: GeneralApiProblem) => {},
  notify: (type : 'error' | 'success' | 'warning' | 'info', text: string, duration?: undefined | number) => {},
  randomString: () => '',
  boostrapPushNotifier: async () => true,
  goPremium: () => {},
  parsePushNotiData: async (params?: {
    notifeeData?: NotifeeNotificationData
  }) => ({ path: '', params: {} }),
  validateMasterPassword: (password: string) => ({ isValid: true, error: '' })
}


export const MixinsContext = createContext(defaultData)

export const MixinsProvider = observer((props: {
  children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal
  navigationRef?: any
}) => {
  const { uiStore, user, cipherStore, collectionStore, folderStore, toolStore } = useStores()
  const insets = useSafeAreaInsets()
  const { userService } = useCoreService()

  // ------------------------ DATA -------------------------

  const isDark = uiStore.isDark
  const themeColor = isDark ? colorDark : color

  // ------------------------ SUPPORT -------------------------

  // Set tokens
  const setApiTokens = (token: string) => {
    user.setApiToken(token)
    cipherStore.setApiToken(token)
    collectionStore.setApiToken(token)
    folderStore.setApiToken(token)
    toolStore.setApiToken(token)
  }

  // Get current route name
  const getRouteName = async () => {
    const res = await load('NAVIGATION_STATE')
    let route = res.routes.slice(-1)[0]
    while (route.state && route.state.routes) {
      route = route.state.routes.slice(-1)[0]
    }
    return route.name
  }

  // Alert message
  const notify = (
    type : 'error' | 'success' | 'info',
    text: null | string,
    duration?: undefined | number
  ) => {
    Toast.show({
      type: type,
      text2: text,
      position: 'top',
      autoHide: true,
      visibilityTime: duration ? duration : type === 'error' ? 3000 : 2000,
      topOffset: insets.top + 10,
      onPress: () => {
        Toast.hide()
      }
    })
  }

  // Random string
  const randomString = () => {
    return nanoid()
  }

  // Clipboard
  const copyToClipboard = (text: string) => {
    notify('success', translate('common.copied_to_clipboard'), 1000)
    Clipboard.setString(text)
  }

  // Get website logo
  const getWebsiteLogo = (uri: string) => {
    const domain = extractDomain(uri)
    if (!uri || !domain) {
      return { uri: null }
    }
    const imgUri = `${GET_LOGO_URL}/${domain}?size=120`
    return { uri: imgUri }
  }

  // Get all org
  const getAllOrganizations = () => {
    return userService.getAllOrganizations()
  }

  // Get team
  const getTeam = (teams: object[], orgId: string) => {
    return find(teams, e => e.id === orgId) || { name: '', role: '', type: 0 }
  }

  // Check if biometric is viable
  const isBiometricAvailable = async () => {
    try {
      const { available } = await ReactNativeBiometrics.isSensorAvailable()
      return available
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error('isBiometricAvailable: ' + e)
      return false
    }
  }

  // Custom translate to force re render
  const translate = (tx: TxKeyPath, options?: i18n.TranslateOptions) => {
    // Dummy to force rerender
    // @ts-ignore
    const abc = user.language
    return tl(tx, options)
  }

  // Notify based on api error
  const notifyApiError = (problem: GeneralApiProblem) => {
    switch (problem.kind) {
      case 'cannot-connect':
        notify('error', translate('error.network_error'))
        break
      case 'rejected':
        notify('error', translate('error.invalid_data'))
        break
      case 'bad-data':
        const errorData: {
          details?: {
            [key: string]: string[]
          }
          code: string
          message?: string
        } = problem.data
        if (errorData.details) {
          let notified = false
          Object.keys(errorData.details).forEach((key) => {
            if (errorData.details[key][0]) {
              notify('error', errorData.details[key][0])
              notified = true
            }
          })
          if (!notified) {
            notify('error', errorData.message || translate('error.invalid_data'))
          }
        } else if (errorData.message) {
          notify('error', errorData.message)
        } else {
          notify('error', translate('error.invalid_data'))
        }
        break
      case 'forbidden':
        notify('error', translate('error.forbidden'))
        break
      case 'not-found':
        notify('error', translate('error.not_found'))
        break
      case 'unauthorized':
        notify('error', translate('error.token_expired'))
        break
      default:
        notify('error', translate('error.something_went_wrong'))
    }
  }

  // Setup push notifier
  const boostrapPushNotifier = async () => {
    try {
      if (user.disablePushNotifications) {
        return true
      }
      const permissionGranted = await PushNotifier.getPermission()
      if (permissionGranted) {
        const token = await PushNotifier.getToken()
        // Logger.debug(token)
        user.setFCMToken(token)
        return true
      } else {
        user.setFCMToken(null)
        return true
      }
    } catch (e) {
      Logger.error('boostrapPushNotifier: ' + e)
      return false
    }
  }

  // Go premium (navigate to payment screen)
  const goPremium = () => {
    if (props.navigationRef.current) {
      props.navigationRef.current.navigate('payment')
    }
  }

  // Parse storage push notification data
  const parsePushNotiData = async (params?: {
    notifeeData?: NotifeeNotificationData
  }) => {
    const { notifeeData } = params || {}
    const res = {
      path: '',
      params: {}
    }
    let data: PushNotiData | NotifeeNotificationData = notifeeData
    if (!data) {
      data = await load(StorageKey.PUSH_NOTI_DATA) 
    }

    if (data) {
      switch (data.type) {
        case PushEvent.SHARE_NEW:
          res.path = 'mainTab'
          res.params = {
            screen: 'browseTab',
            params: {
              screen: 'sharedItems'
            }
          }
          break
        case PushEvent.SHARE_CONFIRM:
          res.path = 'mainTab'
          res.params = {
            screen: 'browseTab',
            params: {
              screen: 'shareItems'
            }
          }
          break
      }
    }
    await remove(StorageKey.PUSH_NOTI_DATA)
    return res
  }

  // Validate master password
  const validateMasterPassword = (password: string) => {
    let isValid = true
    let error = ''

    const MIN_LENGTH = 8
    if (password.length && password.length < MIN_LENGTH) {
      isValid = false
      error = translate('policy.min_password_length', { length: MIN_LENGTH })
    }

    return {
      isValid,
      error
    }
  }

  // -------------------- REGISTER FUNCTIONS ------------------

  const data = {
    color: themeColor,
    isDark,

    setApiTokens,
    notify,
    randomString,
    getWebsiteLogo,
    getAllOrganizations,
    getTeam,
    copyToClipboard,
    getRouteName,
    isBiometricAvailable,
    translate,
    notifyApiError,
    boostrapPushNotifier,
    goPremium,
    parsePushNotiData,
    validateMasterPassword
  }

  return (
    <MixinsContext.Provider value={data}>
      {props.children}
    </MixinsContext.Provider>
  )
})

export const useMixins = () => useContext(MixinsContext)
