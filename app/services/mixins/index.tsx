import React from 'react'
import { nanoid } from 'nanoid'
import find from 'lodash/find'
import ReactNativeBiometrics from 'react-native-biometrics'
import Toast from 'react-native-toast-message'
import { useStores } from '../../models'
import Clipboard from '@react-native-clipboard/clipboard'
import { load } from '../../utils/storage'
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


const { createContext, useContext } = React

// Mixins data
const defaultData = {
  // Data
  color,
  isDark: false,

  // Methods
  getWebsiteLogo: (uri: string) => ({ uri: '' }),
  getTeam: (teams: object[], orgId: string) => ({ name: '', role: '' }),
  copyToClipboard: (text: string) => {},
  getRouteName: async () => { return '' },
  isBiometricAvailable: async () => { return false },
  translate: (tx: TxKeyPath, options?: i18n.TranslateOptions) => { return '' },
  notifyApiError: (problem: GeneralApiProblem) => {},
  notify: (type : 'error' | 'success' | 'warning' | 'info', text: string, duration?: undefined | number) => {},
  randomString: () => '',
  boostrapPushNotifier: async () => {}
}


export const MixinsContext = createContext(defaultData)

export const MixinsProvider = observer((props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {
  const { uiStore, user } = useStores()
  const insets = useSafeAreaInsets()

  // ------------------------ DATA -------------------------

  const isDark = uiStore.isDark
  const themeColor = isDark ? colorDark : color

  // ------------------------ SUPPORT -------------------------

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
      visibilityTime: duration ? duration : type === 'error' ? 3000 : 1500,
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

  // Get team
  const getTeam = (teams: object[], orgId: string) => {
    return find(teams, e => e.id === orgId) || { name: '', role: '' }
  }

  // Check if biometric is viable
  const isBiometricAvailable = async () => {
    try {
      const { available } = await ReactNativeBiometrics.isSensorAvailable()
      return available
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
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
        if (errorData.details && Object.keys(errorData.details).length) {
          Object.keys(errorData.details).forEach((key) => {
            notify('error', errorData.details[key][0])
          })
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
    if (user.disablePushNotifications) {
      return
    }
    const permissionGranted = await PushNotifier.getPermission()
    if (permissionGranted) {
      const token = await PushNotifier.getToken()
      user.setFCMToken(token)
    } else {
      user.setFCMToken(null)
    }
  }

  // -------------------- REGISTER FUNCTIONS ------------------

  const data = {
    color: themeColor,
    isDark,

    notify,
    randomString,
    getWebsiteLogo,
    getTeam,
    copyToClipboard,
    getRouteName,
    isBiometricAvailable,
    translate,
    notifyApiError,
    boostrapPushNotifier
  }

  return (
    <MixinsContext.Provider value={data}>
      {props.children}
    </MixinsContext.Provider>
  )
})

export const useMixins = () => useContext(MixinsContext)
