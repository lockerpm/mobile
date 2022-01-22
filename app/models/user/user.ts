import { Instance, SnapshotOut, types, cast } from "mobx-state-tree"
import { setLang } from "../../i18n"
import { ChangePasswordData, RegisterLockerData, SessionLoginData, LoginData, RegisterData } from "../../services/api"
import { UserApi } from "../../services/api/user-api"
import { save, storageKeys } from "../../utils/storage"
import { withEnvironment } from "../extensions/with-environment"
import DeviceInfo from 'react-native-device-info'


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
    plan: types.maybeNull(types.frozen()),
    invitations: types.array(types.frozen()),
    introShown: types.maybeNull(types.boolean),
    biometricIntroShown: types.maybeNull(types.boolean),

    // User settings
    language: types.optional(types.string, 'en'),
    isBiometricUnlock: types.maybeNull(types.boolean),
    appTimeout: types.optional(types.number, AppTimeoutType.APP_CLOSE),
    appTimeoutAction: types.optional(types.string, TimeoutActionType.LOCK),
    defaultTab: types.optional(types.string, 'homeTab'),
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
      self.isLoggedInPw = true
      self.pwd_user_id = userSnapshot.pwd_user_id
      self.is_pwd_manager = userSnapshot.is_pwd_manager
      self.default_team_id = userSnapshot.default_team_id
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
    setPlan: (plan: object) => {
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
    setDeviceID: (id: string) => {
      self.environment.api.apisauce.setHeader('device-id', id)
    },
    setLanguage: (lang: string) => {
      self.language = lang
      setLang(lang)
      save(storageKeys.APP_CURRENT_USER, {
        language: lang
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
    }
  }))
  .actions((self) => ({
    // -------------------- ID ------------------------

    getUser: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getUser(self.apiToken)
      if (res.kind === "ok") {
        if (self.email && res.user.email !== self.email) {
          self.clearSettings()
        }
        self.saveUser(res.user)
      }
      return res
    },

    sendOtpEmail: async (username: string, password: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.sendOtpEmail({ username, password })
      return res
    },

    recoverAccount: async (username: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.recoverAccount({ username })
      return res
    },

    resetPassword: async (username: string, method: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.resetPassword({ username, method })
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

    login: async (payload: LoginData, isOtp?: boolean) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.login(payload, isOtp)
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

    socialLogin: async (payload: { provider: string, access_token: string }) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.socialLogin(payload)
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
    }
  }))

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type UserType = Instance<typeof UserModel>
export interface User extends UserType {}
type UserSnapshotType = SnapshotOut<typeof UserModel>
export interface UserSnapshot extends UserSnapshotType {}
export const createUserDefaultModel = () => types.optional(UserModel, {})
