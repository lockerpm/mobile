import { Instance, SnapshotOut, types, cast } from "mobx-state-tree"
import { setLang } from "../../i18n"
import { ChangePasswordData, RegisterLockerData, SessionLoginData, LoginData, RegisterData, SocialLoginData, NotificationSettingData } from "../../services/api"
import { UserApi } from "../../services/api/user-api"
import { save, StorageKey, remove } from "../../utils/storage"
import { withEnvironment } from "../extensions/with-environment"
import DeviceInfo from 'react-native-device-info'
import moment from "moment"
import { omit } from "ramda"
import { AppEventType, EventBus } from "../../utils/event-bus"


export enum AppTimeoutType {
  SCREEN_OFF = -1,
  APP_CLOSE = 0
}
export enum TimeoutActionType {
  LOCK = 'lock',
  LOGOUT = 'logout'
}


/**
 * Model description here for TypeScript hints.
 */
export const UserModel = types
  .model("User")
  .props({
    apiToken: types.maybeNull(types.string),
    fcmToken: types.maybeNull(types.string),
    deviceId: types.maybeNull(types.string),

    // ID
    isLoggedIn: types.maybeNull(types.boolean),
    email: types.maybeNull(types.string),
    username: types.maybeNull(types.string),
    full_name: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),

    // PM
    isLoggedInPw: types.maybeNull(types.boolean),
    pwd_user_id: types.maybeNull(types.string),
    is_pwd_manager: types.maybeNull(types.boolean),
    default_team_id: types.maybeNull(types.string),
    fingerprint: types.maybeNull(types.string),

    // Others data
    teams: types.array(types.frozen()),
    plan: types.maybeNull(types.frozen<{
      name: string;
      alias: string;
      is_family: boolean;
      cancel_at_period_end: boolean;
      duration: "monthly" | "yearly";
      next_billing_time: number
      payment_method: string
    }>()),
    invitations: types.array(types.frozen()),
    introShown: types.maybeNull(types.boolean),
    biometricIntroShown: types.maybeNull(types.boolean),

    // User settings
    language: types.optional(types.string, 'en'),
    isBiometricUnlock: types.maybeNull(types.boolean),
    appTimeout: types.optional(types.number, AppTimeoutType.APP_CLOSE),
    appTimeoutAction: types.optional(types.string, TimeoutActionType.LOCK),
    defaultTab: types.optional(types.string, 'homeTab'),
    notificationSettings: types.maybeNull(types.frozen<NotificationSettingData[]>()),
    disablePushNotifications: types.maybeNull(types.boolean)
  })
  .extend(withEnvironment)
  .views((self) => ({}))
  .actions((self) => ({
    // Token
    setApiToken: (token: string) => {
      self.apiToken = token
    },
    setFCMToken: (token: string) => {
      self.fcmToken = token
    },

    // Info
    saveUser: (userSnapshot: UserSnapshot) => {
      self.isLoggedIn = true
      self.email = userSnapshot.email
      self.username = userSnapshot.username
      self.full_name = userSnapshot.full_name
      self.avatar = userSnapshot.avatar
    },
    saveUserPw: (userSnapshot: UserSnapshot) => {
      self.pwd_user_id = userSnapshot.pwd_user_id
      self.is_pwd_manager = userSnapshot.is_pwd_manager
      self.default_team_id = userSnapshot.default_team_id
      save(StorageKey.APP_CURRENT_USER, {
        language: self.language,
        pwd_user_id: self.pwd_user_id
      })
    },
    clearUser: () => {
      self.isLoggedIn = false
      self.isLoggedInPw = false
      self.apiToken = ''
      self.email = ''
      self.username = ''
      self.full_name = ''
      self.avatar = ''
      self.pwd_user_id = ''
      self.is_pwd_manager = false
      self.default_team_id = ''
      self.teams = cast([])
      self.invitations = cast([])
      self.plan = null
      self.fingerprint = ''
      remove(StorageKey.APP_CURRENT_USER)
    },
    clearSettings: () => {
      self.isBiometricUnlock = false
      self.appTimeout = AppTimeoutType.APP_CLOSE
      self.appTimeoutAction = TimeoutActionType.LOCK
      self.defaultTab = 'homeTab'
      self.disablePushNotifications = false
    },
    setLoggedIn: (isLoggedIn: boolean) => {
      self.isLoggedIn = isLoggedIn
    },
    setLoggedInPw: (isLoggedInPw: boolean) => {
      self.isLoggedInPw = isLoggedInPw
    },
    setFingerprint: (fingerprint: string) => {
      self.fingerprint = fingerprint
    },

    // Others data
    setTeams: (teams: object[]) => {
      self.teams = cast(teams)
    },
    setPlan: (plan: {
      name: string;
      alias: string;
      is_family: boolean;
      cancel_at_period_end: boolean;
      duration: "monthly" | "yearly";
      next_billing_time: any
      payment_method: string
    }) => {
      self.plan = cast(plan)
    },
    setInvitations: (invitations: object[]) => {
      self.invitations = cast(invitations)
    },
    setIntroShown: (val: boolean) => {
      self.introShown = val
    },
    setBiometricIntroShown: (val: boolean) => {
      self.biometricIntroShown = val
    },

    // User settings
    setDeviceId: (id: string) => {
      self.deviceId = id
    },
    setLanguage: (lang: string) => {
      self.language = lang
      setLang(lang)
      switch (lang) {
        case 'vi':
          moment.locale('vi', {
            months: 'tháng 1_tháng 2_tháng 3_tháng 4_tháng 5_tháng 6_tháng 7_tháng 8_tháng 9_tháng 10_tháng 11_tháng 12'.split('_'),
            monthsShort: 'Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12'.split('_'),
            relativeTime: {
              future: '%s tới',
              past: '%s trước',
              s: 'Vài giây',
              m: '1 phút',
              mm: '%d phút',
              h: '1 giờ',
              hh: '%d giờ',
              d: '1 ngày',
              dd: '%d ngày',
              M: '1 tháng',
              MM: '%d tháng',
              y: '1 năm',
              yy: '%d năm'
            },
            longDateFormat: {
              LT: 'HH:mm',
              LTS: 'HH:mm:ss',
              L: 'DD/MM/YYYY',
              LL: 'D MMMM [năm] YYYY',
              LLL: 'D MMMM [năm] YYYY HH:mm',
              LLLL: 'dddd, D MMMM [năm] YYYY HH:mm',
              l: 'DD/M/YYYY',
              ll: 'D MMM YYYY',
              lll: 'D MMM YYYY HH:mm',
              llll: 'ddd, D MMM YYYY HH:mm'
            },
            week: {
              dow: 1 // Monday is the first day of the week.
            }
          })
          break
        default:
          moment.locale('en')
      }
      save(StorageKey.APP_CURRENT_USER, {
        language: lang,
        pwd_user_id: self.pwd_user_id
      })
    },
    setBiometricUnlock: (isActive: boolean) => {
      self.isBiometricUnlock = isActive
    },
    setAppTimeout: (timeout: number) => {
      self.appTimeout = timeout
    },
    setAppTimeoutAction: (action: string) => {
      self.appTimeoutAction = action
    },
    setDefaultTab: (defaultTab: string) => {
      self.defaultTab = defaultTab
    },
    setPushNotificationsSetting: (val: boolean) => {
      self.disablePushNotifications = val
    },
    setNotificationSettings: (val: NotificationSettingData[]) => {
      self.notificationSettings = val
    },

    // DEV
    setUserFreePlan: () => {
      if (__DEV__) {
        self.plan = {
          name: "Free",
          is_family: false,
          alias: "pm_free",
          cancel_at_period_end: false,
          duration: "monthly",
          next_billing_time: 0,
          payment_method: "mobile"
        }
      }
    }
  }))
  .actions((self) => ({
    // -------------------- ID ------------------------

    getUser: async (options?: {
      customToken?: string,
      dontSetData?: boolean
    }) => {
      console.log(self.language)
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getUser(options?.customToken || self.apiToken)
      if (res.kind === "ok" && !options?.dontSetData) {
        if (self.email && res.user.email !== self.email) {
          
          EventBus.emit(AppEventType.CLEAR_ALL_DATA, null)
          self.clearSettings()
        }
        console.log(res.user)
        self.saveUser(res.user)
      }
      return res
    },

    sendOtpEmail: async (username: string, password: string, request_code: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.sendOtpEmail({ username, password, request_code })
      return res
    },

    recoverAccount: async (username: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.recoverAccount({ username })
      return res
    },

    resetPassword: async (username: string, method: string, request_code?: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.resetPassword({ username, method, request_code })
      return res
    },

    resetPasswordWithCode: async (username: string, code: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.resetPasswordWithCode({ username, code })
      return res
    },

    setNewPassword: async (new_password: string, token: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.setNewPassword({ new_password, token })
      return res
    },

    setSocialPassword: async (new_password: string, token: string, username?: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.setPassword({ new_password, token, username })
      return res
    },


    login: async (payload: LoginData, isOtp?: boolean) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.login(payload, self.deviceId, isOtp)
      if (res.kind === "ok") {
        if (res.data.token) {
          const pmRes = await userApi.getPMToken(res.data.token, {
            SERVICE_URL: '/',
            SERVICE_SCOPE: 'pwdmanager',
            CLIENT: 'mobile'
          })
          if (pmRes.kind === 'ok') {
            self.setApiToken(pmRes.data.access_token)
            self.setLoggedIn(true)
          }
          return pmRes
        }
      }
      return res
    },

    socialLogin: async (payload: SocialLoginData) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.socialLogin(payload)
      return res
    },

    getPMToken: async (token: string) => {
      const userApi = new UserApi(self.environment.api)
      const pmRes = await userApi.getPMToken(token, {
        SERVICE_URL: '/',
        SERVICE_SCOPE: 'pwdmanager',
        CLIENT: 'mobile'
      })

      if (pmRes.kind === 'ok') {
        self.setApiToken(pmRes.data.access_token)
        self.setLoggedIn(true)
      }
      return pmRes
    },

    register: async (payload: RegisterData) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.register(payload)
      return res
    },

    logout: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.logout(self.apiToken)
      self.clearUser()
      self.clearSettings()
      return res
    },

    deauthorizeSessions: async (hashedPassword: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.deauthorizeSessions(self.apiToken, hashedPassword)
      return res
    },

    purgeAccount: async (hashedPassword: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.purgeAccount(self.apiToken, hashedPassword)
      return res
    },

    deleteAccount: async (hashedPassword: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.deleteAccount(self.apiToken, hashedPassword)
      return res
    },

    // -------------------- LOCKER ------------------------

    sendPasswordHint: async (email: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.sendMasterPasswordHint(self.apiToken, { email })
      return res
    },

    getInvitations: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getInvitations(self.apiToken)
      if (res.kind === 'ok') {
        self.setInvitations(res.data)
      }
      return res
    },

    invitationRespond: async (id: string, status: 'accept' | 'reject') => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.invitationRespond(self.apiToken, id, status)
      return res
    },

    getUserPw: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getUserPw(self.apiToken)
      if (res.kind === "ok") {
        self.saveUserPw(res.user)
      }
      return res
    },

    sessionLogin: async (payload: SessionLoginData) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.sessionLogin(self.apiToken, payload)
      if (res.kind === "ok") {
        self.setLoggedInPw(true)
      }
      return res
    },

    registerLocker: async (payload: RegisterLockerData) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.registerLocker(self.apiToken, payload)
      return res
    },

    changeMasterPassword: async (payload: ChangePasswordData) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.changeMasterPassword(self.apiToken, payload)
      return res
    },

    lock: () => {
      self.setLoggedInPw(false)
    },

    loadTeams: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getTeams(self.apiToken)
      if (res.kind === "ok") {
        self.setTeams(res.teams)
      }
      return res
    },

    loadPlan: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getPlan(self.apiToken)
      if (res.kind === "ok") {
        self.setPlan(res.data)
      }
      return res
    },

    getPolicy: async (organizationId: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getPolicy(self.apiToken, organizationId)
      return res
    },

    feedback: async (description: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.sendFeedback(self.apiToken, {
        type: 'feedback',
        description
      })
      return res
    },

    updateFCM: async (token: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.updateFCM(self.apiToken, {
        fcm_id: token,
        device_identifier: DeviceInfo.getUniqueId()
      })
      return res
    },

    getBillingDocuments: async (page: number) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getBillingDocuments(self.apiToken, page)
      return res
    },

    getOfferDetailsIOS: async (productIdentifier: string, offerIdentifier: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.fetchOfferDetailsIOS(self.apiToken, productIdentifier, offerIdentifier)
      return res
    },


    getFamilyMember: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getFamilyMember(self.apiToken)
      return res
    },

    addFamilyMember: async (memberEmails: string[]) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.addFamilyMember(self.apiToken, memberEmails)
      return res
    },

    removeFamilyMember: async (memberID: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.removeFamilyMember(self.apiToken, memberID)
      return res
    },

    getReferLink: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getReferLink(self.apiToken)
      return res
    },

    getTrialEligible: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getTrialEligible(self.apiToken)
      return res
    },

    getNotificationSettings: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getNotificationSettings(self.apiToken)
      if (res.kind === "ok") {
        self.setNotificationSettings(res.data)
      }
      return res
    },
    updateNotiSettings: async (categoryId: string, mail: boolean, notification: boolean) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.updateNotiSettings(self.apiToken, categoryId, mail, notification)
      return res
    },
    fetchInAppNoti: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.fetchInAppNoti(self.apiToken)
      return res
    },

    markReadInAppNoti: async (id: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.markReadInappNoti(self.apiToken, id)
      return res
    }

  }))
  .actions((self) => ({
    //receipt: 'receipt_data' for ios, 'purchase_token' for android
    purchaseValidation: async (receipt?: string, subscriptionId?: string, originalTransactionIdentifierIOS?: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.purchaseValidation(self.apiToken, receipt, subscriptionId, originalTransactionIdentifierIOS)
      return res
    }
  }))
  .postProcessSnapshot(omit(['isLoggedInPw']))

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type UserType = Instance<typeof UserModel>
export interface User extends UserType { }
type UserSnapshotType = SnapshotOut<typeof UserModel>
export interface UserSnapshot extends UserSnapshotType { }
export const createUserDefaultModel = () => types.optional(UserModel, {})
