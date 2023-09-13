import { useCoreService } from '../core-service'
import find from 'lodash/find'
import { nanoid } from 'nanoid'
import { useStores } from 'app/models'
import { PushNotiData, StorageKey, load, remove } from 'app/utils/storage'
import { PushNotifier } from 'app/utils/pushNotification'
import { Logger } from 'app/utils/utils'
import Toast from 'react-native-toast-message'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Clipboard from '@react-native-clipboard/clipboard'
import ReactNativeBiometrics from 'react-native-biometrics'
import { MASTER_PW_MIN_LENGTH, MAX_CIPHER_SELECTION } from 'app/static/constants'
import { GeneralApiProblem } from '../api/apiProblem'
import { NotifeeNotificationData, PushEvent } from 'app/utils/pushNotification/types'
import { translate } from 'app/i18n'

export function useHelper() {
  const {
    user,
    cipherStore,
    collectionStore,
    folderStore,
    toolStore,
    enterpriseStore,
  } = useStores()
  const { userService } = useCoreService()
  const insets = useSafeAreaInsets()

  // Alert message
  const notify = (
    type: 'error' | 'success' | 'info',
    text: null | string,
    duration?: undefined | number
  ) => {
    Toast.show({
      type,
      text2: text,
      position: 'top',
      autoHide: true,
      visibilityTime: duration || (type === 'error' ? 3000 : 2000),
      topOffset: insets.top + 10,
      onPress: () => {
        Toast.hide()
      },
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
    const res = await load('NAVIGATION_STATE')
    let route = res.routes.slice(-1)[0]
    while (route.state && route.state.routes) {
      route = route.state.routes.slice(-1)[0]
    }
    return route.name
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

  // Get all org
  const getAllOrganizations = () => {
    return userService.getAllOrganizations()
  }

  // Get team
  const getTeam = (teams: any[], orgId: string) => {
    return find(teams, (e) => e.id === orgId) || { name: '', role: '', type: 0 }
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

  // Notify based on api error
  const notifyApiError = async (problem: GeneralApiProblem) => {
    console.log(problem.kind)
    switch (problem.kind) {
      case 'cannot-connect':
        notify('error', translate('error.cannot_connect'))
        break

      case 'network-error':
        notify('error', translate('error.network_error'))
        break

      case 'rejected':
        notify('error', translate('error.invalid_data'))
        break

      case 'bad-data': {
        const errorData: {
          details?: {
            [key: string]: string[]
          }
          code: string
          message?: string
        } = problem.data
        if (errorData.code === '5001') {
          notify(
            'error',
            translate('error.cannot_update_more_at_once', { count: MAX_CIPHER_SELECTION })
          )
          break
        }

        let errorMessage = ''
        if (errorData.details) {
          for (const key of Object.keys(errorData.details)) {
            if (errorData.details[key][0]) {
              if (!errorMessage) {
                errorMessage = errorData.details[key][0]
              }
            }
          }
        }
        notify('error', errorMessage || errorData.message || translate('error.invalid_data'))
        break
      }

      case 'forbidden':
        notify('error', translate('error.forbidden'))
        break

      case 'not-found':
        notify('error', translate('error.not_found'))
        break

      case 'unauthorized':
        notify('error', translate('error.token_expired'))
        break

      case 'timeout':
        notify('error', translate('error.network_timeout'))
        break

      case 'server':
        notify('error', translate('error.server_error'))
        break

      default:
        notify('error', translate('error.something_went_wrong'))
    }
  }

  // Parse storage push notification data
  const parsePushNotiData = async (params?: {
    notifeeData?: NotifeeNotificationData
    tipTrick?: boolean
  }) => {
    const { notifeeData, tipTrick } = params || {}
    const res = {
      path: '',
      params: {},
      tempParams: {},
      url: '',
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
              screen: 'sharedItems',
            },
          }
          res.tempParams = {
            screen: 'browseTab',
          }
          break
        case PushEvent.SHARE_CONFIRM:
        case PushEvent.SHARE_ACCEPT:
        case PushEvent.SHARE_REJECT:
          res.path = 'mainTab'
          res.params = {
            screen: 'browseTab',
            params: {
              screen: 'shareItems',
            },
          }
          res.tempParams = {
            screen: 'browseTab',
          }
          break

        case PushEvent.EMERGENCY_INVITE:
        case PushEvent.EMERGENCY_REJECT_REQUEST:
        case PushEvent.EMERGENCY_APPROVE_REQUEST:
          res.path = 'contactsTrustedYou'
          break
        case PushEvent.EMERGENCY_INITIATE:
        case PushEvent.EMERGENCY_ACCEPT_INVITATION:
        case PushEvent.EMERGENCY_REJECT_INVITATION:
          res.path = 'yourTrustedContact'
          break
        case PushEvent.TIP_TRICK:
          res.url = data.url
      }
      if (data.type !== PushEvent.TIP_TRICK || (tipTrick && data.type === PushEvent.TIP_TRICK)) {
        await remove(StorageKey.PUSH_NOTI_DATA)
      }
    }
    return res
  }
  // Validate master password
  const validateMasterPassword = (password: string) => {
    let isValid = true
    let error = ''

    if (password.length && password.length < MASTER_PW_MIN_LENGTH) {
      isValid = false
      error = translate('policy.min_password_length', { length: MASTER_PW_MIN_LENGTH })
    }

    return {
      isValid,
      error,
    }
  }

  return {
    setApiTokens,
    notify,
    randomString,
    getAllOrganizations,
    getTeam,
    copyToClipboard,
    getRouteName,
    isBiometricAvailable,
    notifyApiError,
    boostrapPushNotifier,
    parsePushNotiData,
    validateMasterPassword,
  }
}
