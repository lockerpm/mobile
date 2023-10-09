/* eslint-disable camelcase */
import { Instance, SnapshotIn, SnapshotOut, cast, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"
import { AuthPasskeyRequest, ChangePasswordRequest, Enterprise, LoginData, NotificationSettingData, RegisterLockerRequest, RegisterPasskeyOptionRequest, RegisterPasskeyRequest, RegisterRequest, SessionLoginRequest, SessionOtpLoginRequest, SocialLoginRequest, UserSubscripePlan, UserTeam } from "app/static/types"
import { AccountType, AppTimeoutType, EmergencyAccessType, PlanType, PlanTypeDuration, PolicyType, TimeoutActionType } from "app/static/types/enum"
import { omit } from "ramda"
import { StorageKey, remove, save } from "app/utils/storage"
import moment from "moment"
import { userApi } from "app/services/api/userApi"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { idApi } from "app/services/api/idApi"
import { toolApi } from "app/services/api/toolApi"
import DeviceInfo from "react-native-device-info"
import { setLang } from "app/i18n"


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
    pwd_user_type: types.maybeNull(types.string),
    is_pwd_manager: types.maybeNull(types.boolean),
    default_team_id: types.maybeNull(types.string),
    fingerprint: types.maybeNull(types.string),

    // Others data
    enterprise: types.maybeNull(types.frozen<Enterprise>()),
    teams: types.array(types.frozen<UserTeam>()),
    plan: types.maybeNull(types.frozen<UserSubscripePlan>()),
    invitations: types.array(types.string),
    introShown: types.maybeNull(types.boolean),
    biometricIntroShown: types.maybeNull(types.boolean),

    // On premise user
    onPremiseUser: types.maybeNull(types.boolean),
    onPremiseLastBaseUrl: types.maybeNull(types.string),
    isPasswordlessLogin: types.maybeNull(types.boolean),

    // User settings
    language: types.optional(types.string, "en"),
    isBiometricUnlockList: types.array(types.string), // store user email
    appTimeout: types.optional(types.number, AppTimeoutType.APP_CLOSE),
    appTimeoutAction: types.optional(types.string, TimeoutActionType.LOCK),
    defaultTab: types.optional(types.string, "homeTab"),
    notificationSettings: types.maybeNull(types.frozen<NotificationSettingData[]>()),
    disablePushNotifications: types.maybeNull(types.boolean),

    // cache
    isMobileLangChange: types.maybeNull(types.boolean),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get isFreePlan() {
      return self.plan && self.plan.alias === PlanType.FREE
    },
    get isFamilyPlan() {
      return self.plan && self.plan.alias === PlanType.FAMILY
    },
    get isLifeTimePlan() {
      return self.plan && self.plan.alias === PlanType.LIFETIME
    },
    get isShowPremiumFeature() {
      return self.plan && self.plan.alias === PlanType.PREMIUM
    },
    get isEnterprise() {
      return self.pwd_user_type === "enterprise" && self.enterprise
    },
    get isBiometricUnlock() {
      return self.isBiometricUnlockList.includes(self.email)
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setApiToken: (token: string) => {
      self.apiToken = token
    },
    setFCMToken: (token: string) => {
      self.fcmToken = token
    },
    setOnPremaiseEmail: (email: string) => {
      self.email = email
    },
    setOnPremiseUser: (val: boolean) => {
      self.onPremiseUser = val
    },
    setPasswordlessLogin: (val: boolean) => {
      self.isPasswordlessLogin = val
    },
    setOnPremiseLastBaseUrl: (baseUrl: string) => {
      self.onPremiseLastBaseUrl = baseUrl
    },
    saveUser: (userSnapshot: UserSnapshotIn) => {
      self.isLoggedIn = true
      self.email = userSnapshot.email
      self.username = userSnapshot.username
      self.full_name = userSnapshot.full_name
      self.avatar = userSnapshot.avatar
    },
    saveUserPw: (userSnapshot: UserSnapshotIn) => {
      self.pwd_user_id = userSnapshot.pwd_user_id
      self.is_pwd_manager = userSnapshot.is_pwd_manager
      self.default_team_id = userSnapshot.default_team_id
      self.pwd_user_type = userSnapshot.pwd_user_type
      save(StorageKey.APP_CURRENT_USER, {
        language: self.language,
        pwd_user_id: self.pwd_user_id,
      })
    },
    saveEnterprise: (enterprise: Enterprise[]) => {
      self.enterprise = enterprise[0]
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
    setTeams: (teams: UserTeam[]) => {
      self.teams = cast(teams)
    },
    setPlan: (plan: UserSubscripePlan) => {
      self.plan = cast(plan)
    },
    setInvitations: (invitations: any[]) => {
      self.invitations = cast(invitations)
    },
    setIntroShown: (val: boolean) => {
      self.introShown = val
    },
    setBiometricIntroShown: (val: boolean) => {
      self.biometricIntroShown = val
    },
    setMobileChangeLanguage: (val: boolean) => {
      self.isMobileLangChange = val
    },
    // User settings
    setDeviceId: (id: string) => {
      self.deviceId = id
    },
    setLanguage: (lang: string) => {
      self.language = lang
      setLang(lang)
      switch (lang) {
        case "vi":
          moment.locale("vi", {
            months: "tháng 1_tháng 2_tháng 3_tháng 4_tháng 5_tháng 6_tháng 7_tháng 8_tháng 9_tháng 10_tháng 11_tháng 12".split(
              "_",
            ),
            monthsShort: "Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12".split("_"),
            relativeTime: {
              future: "%s tới",
              past: "%s trước",
              s: "Vài giây",
              m: "1 phút",
              mm: "%d phút",
              h: "1 giờ",
              hh: "%d giờ",
              d: "1 ngày",
              dd: "%d ngày",
              M: "1 tháng",
              MM: "%d tháng",
              y: "1 năm",
              yy: "%d năm",
            },
            longDateFormat: {
              LT: "HH:mm",
              LTS: "HH:mm:ss",
              L: "DD/MM/YYYY",
              LL: "D MMMM [năm] YYYY",
              LLL: "D MMMM [năm] YYYY HH:mm",
              LLLL: "dddd, D MMMM [năm] YYYY HH:mm",
              l: "DD/M/YYYY",
              ll: "D MMM YYYY",
              lll: "D MMM YYYY HH:mm",
              llll: "ddd, D MMM YYYY HH:mm",
            },
            week: {
              dow: 1, // Monday is the first day of the week.
            },
          })
          break
        default:
          moment.locale("en")
      }
      save(StorageKey.APP_CURRENT_USER, {
        language: lang,
        pwd_user_id: self.pwd_user_id,
      })
    },
    setBiometricUnlock: (isActive: boolean) => {
      if (isActive) {
        self.isBiometricUnlockList = cast([self.email, ...self.isBiometricUnlockList])
      } else {
        const index = self.isBiometricUnlockList.findIndex((e) => e === self.email)
        if (index >= 0) {
          self.isBiometricUnlockList.splice(index, 1)
        }
      }
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
    clearUser: () => {
      self.apiToken = ""

      // ID
      self.isLoggedIn = false
      self.email = ""
      self.username = ""
      self.full_name = ""
      self.avatar = ""

      // PM
      self.isLoggedInPw = false
      self.pwd_user_id = ""
      self.pwd_user_type = ""
      self.is_pwd_manager = false
      self.default_team_id = ""

      self.teams = cast([])
      self.enterprise = null
      self.invitations = cast([])
      self.plan = null
      self.fingerprint = ""
      self.onPremiseUser = false
      self.onPremiseLastBaseUrl = ""
      remove(StorageKey.APP_CURRENT_USER)
    },
    clearSettings: () => {
      self.appTimeout = AppTimeoutType.APP_CLOSE
      self.appTimeoutAction = TimeoutActionType.LOCK
      self.defaultTab = "homeTab"
      self.disablePushNotifications = false
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    // -------------------- ID ------------------------
    getUser: async (options?: { customToken?: string; dontSetData?: boolean }) => {
      const res = await userApi.getUser(options?.customToken || self.apiToken)
      if (res.kind === "ok" && !options?.dontSetData) {
        if (self.email && res.user.email !== self.email) {
          EventBus.emit(AppEventType.CLEAR_ALL_DATA, null)
          self.clearSettings()
        }
        if (self.language !== res.user.language) {
          if (self.isMobileLangChange) {
            await userApi.setUserLanguage(self.apiToken, self.language)
          } else {
            self.setLanguage(res.user.language)
          }
        }
        self.saveUser(res.user)
      }
      return res
    },
    sendOtpEmail: async (username: string, password: string, request_code: string) => {
      const res = await idApi.sendOtpEmail({ username, password, request_code })
      return res
    },

    recoverAccount: async (username: string) => {
      const res = await idApi.recoverAccount({ username })
      return res
    },

    resetPassword: async (username: string, method: string, request_code?: string) => {
      const res = await idApi.resetPassword({ username, method, request_code })
      return res
    },

    resetPasswordWithCode: async (username: string, code: string) => {
      const res = await idApi.resetPasswordWithCode({ username, code })
      return res
    },

    setNewPassword: async (new_password: string, token: string) => {
      const res = await idApi.setNewPassword({ new_password, token })
      return res
    },

    setSocialPassword: async (new_password: string, token: string, username?: string) => {
      const res = await idApi.setPassword({ new_password, token, username })
      return res
    },

    webAuthListCredentials: async (paging: number) => {
      const res = await idApi.webAuthListCredentials(self.apiToken, paging)
      return res
    },

    loginMethod: async (username: string) => {
      const res = await idApi.loginMethod(username)
      return res
    },

    login: async (payload: LoginData, isOtp?: boolean) => {
      const res = await idApi.login(payload, self.deviceId, isOtp)
      if (res.kind === "ok") {
        if (res.data.token) {
          const pmRes = await userApi.getPMToken(
            res.data.token,
            {
              SERVICE_URL: "/",
              SERVICE_SCOPE: "pwdmanager",
              CLIENT: "mobile",
            },
            self.deviceId,
          )
          if (pmRes.kind === "ok") {
            self.setApiToken(pmRes.data.access_token)
            self.setLoggedIn(true)
          }
          return pmRes
        }
      }
      return res
    },

    authPasskey: async (payload: AuthPasskeyRequest) => {
      const res = await idApi.authPasskey(payload, self.deviceId)
      if (res.kind === "ok") {
        if (res.data.token) {
          const pmRes = await userApi.getPMToken(
            res.data.token,
            {
              SERVICE_URL: "/",
              SERVICE_SCOPE: "pwdmanager",
              CLIENT: "mobile",
            },
            self.deviceId,
          )
          if (pmRes.kind === "ok") {
            self.setApiToken(pmRes.data.access_token)
            self.setLoggedIn(true)
          }
          return pmRes
        }
      }
      return res
    },
    authPasskeyOptions: async (username: string) => {
      const res = await idApi.authPasskeyOptions(username)
      return res
    },

    socialLogin: async (payload: SocialLoginRequest) => {
      const res = await idApi.socialLogin(payload, self.deviceId)
      return res
    },

    getPMToken: async (token: string) => {
      const pmRes = await userApi.getPMToken(
        token,
        {
          SERVICE_URL: "/",
          SERVICE_SCOPE: "pwdmanager",
          CLIENT: "mobile",
        },
        self.deviceId,
      )

      if (pmRes.kind === "ok") {
        self.setApiToken(pmRes.data.access_token)
        self.setLoggedIn(true)
      }
      return pmRes
    },

    register: async (payload: RegisterRequest) => {
      const res = await idApi.register(payload)
      return res
    },

    registerPasskeyOptions: async (payload: RegisterPasskeyOptionRequest) => {
      const res = await idApi.registerPasskeyOptions(payload)
      return res
    },

    registerPasskey: async (payload: RegisterPasskeyRequest) => {
      const res = await idApi.registerPasskey(payload)
      return res
    },

    logout: async () => {
      const res = await idApi.logout(self.apiToken)
      self.clearUser()
      self.clearSettings()
      return res
    },

    deauthorizeSessions: async (hashedPassword: string) => {
      const res = await userApi.deauthorizeSessions(self.apiToken, hashedPassword)
      return res
    },

    purgeAccount: async (hashedPassword: string) => {
      const res = await userApi.purgeAccount(self.apiToken, hashedPassword)
      return res
    },

    deleteAccount: async (hashedPassword: string) => {
      const res = await userApi.deleteAccount(self.apiToken, hashedPassword)
      return res
    },

    // -------------------- LOCKER ------------------------
    sendPasswordHint: async (email: string) => {
      const res = await userApi.sendMasterPasswordHint(self.apiToken, { email })
      return res
    },

    getInvitations: async () => {
      const res = await userApi.getInvitations(self.apiToken)
      if (res.kind === "ok") {
        self.setInvitations(res.data)
      }
      return res
    },

    invitationRespond: async (id: string, status: "accept" | "reject") => {
      const res = await userApi.invitationRespond(self.apiToken, id, status)
      return res
    },

    getUserPw: async () => {
      const res = await userApi.getUserPw(self.apiToken)
      if (res.kind === "ok") {
        self.saveUserPw(res.user)
        if (res.user.pwd_user_type === AccountType.ENTERPRISE && !self.onPremiseUser) {
          const _res = await userApi.getEnterprise(self.apiToken)
          if (_res.kind === "ok") {
            self.saveEnterprise(_res.data)
          }
        }
      }
      return res
    },
    getEnterprise: async () => {
      const _res = await userApi.getEnterprise(self.apiToken)
      if (_res.kind === "ok") {
        self.saveEnterprise(_res.data)
      }
    },

    sessionLogin: async (payload: SessionLoginRequest) => {
      const res = await userApi.sessionLogin(self.apiToken, payload)
      if (res.kind === "ok") {
        self.setLoggedInPw(true)
      }
      return res
    },
    sessionOtpLogin: async (payload: SessionOtpLoginRequest) => {
      const res = await userApi.sessionOtpLogin(self.apiToken, payload)
      if (res.kind === "ok") {
        self.setLoggedInPw(true)
      }
      return res
    },
    registerLocker: async (payload: RegisterLockerRequest) => {
      const res = await userApi.registerLocker(self.apiToken, payload)
      return res
    },

    changeMasterPassword: async (payload: ChangePasswordRequest) => {
      const res = await userApi.changeMasterPassword(self.apiToken, payload)
      return res
    },
    changeLanguage: async () => {
      const res = await userApi.setUserLanguage(self.apiToken, self.language)
      return res
    },
    lock: () => {
      self.setLoggedInPw(false)
    },
    loadTeams: async () => {
      const res = await userApi.getTeams(self.apiToken)
      if (res.kind === "ok") {
        self.setTeams(res.teams)
      }
      return res
    },
    loadPlan: async () => {
      if (self.pwd_user_type === "enterprise") {
        self.setPlan({
          name: "Premium",
          is_family: false,
          alias: PlanType.PREMIUM,
          cancel_at_period_end: false,
          duration: PlanTypeDuration.MONTHLY,
          next_billing_time: 0,
          payment_method: "mobile",
        })
        return null
      }
      const res = await userApi.getPlan(self.apiToken)
      if (res.kind === "ok") {
        self.setPlan(res.data)
      }
      return res
    },
    getTeamPolicies: async (organizationId: string) => {
      const res = await userApi.getTeamPolicies(self.apiToken, organizationId)
      return res
    },
    getTeamPolicy: async (organizationId: string, policyType: PolicyType) => {
      const res = await userApi.getTeamPolicy(self.apiToken, organizationId, policyType)
      return res
    },
    feedback: async (description: string) => {
      const res = await userApi.sendFeedback(self.apiToken, {
        type: "feedback",
        description,
      })
      return res
    },
    updateFCM: async (token: string) => {
      const res = await userApi.updateFCM(self.apiToken, {
        fcm_id: token,
        device_identifier: await DeviceInfo.getUniqueId(),
      })
      return res
    },
    getBillingDocuments: async (page: number) => {
      const res = await userApi.getBillingDocuments(self.apiToken, page)
      return res
    },
    getFamilyMember: async () => {
      const res = await userApi.getFamilyMember(self.apiToken)
      return res
    },
    addFamilyMember: async (memberEmails: string[]) => {
      const res = await userApi.addFamilyMember(self.apiToken, memberEmails)
      return res
    },
    removeFamilyMember: async (memberID: string) => {
      const res = await userApi.removeFamilyMember(self.apiToken, memberID)
      return res
    },
    getReferLink: async () => {
      const res = await userApi.getReferLink(self.apiToken)
      return res
    },
    getTrialEligible: async () => {
      const res = await userApi.getTrialEligible(self.apiToken)
      return res
    },
    // NOTIFICATION SETTING
    getNotificationSettings: async () => {
      const res = await userApi.getNotificationSettings(self.apiToken)
      if (res.kind === "ok") {
        self.setNotificationSettings(res.data)
      }
      return res
    },
    updateNotiSettings: async (categoryId: string, mail: boolean, notification: boolean) => {
      const res = await userApi.updateNotiSettings(self.apiToken, categoryId, mail, notification)
      return res
    },
    fetchInAppNoti: async () => {
      const res = await toolApi.fetchInAppNoti(self.apiToken)
      return res
    },
    markReadInAppNoti: async (id: string) => {
      const res = await toolApi.markReadInappNoti(self.apiToken, id)
      return res
    },
    // EMERGENCY ACCESS
    inviteEA: async (email: string, key: string, type: EmergencyAccessType, waitTime: number) => {
      const res = await userApi.EAInvite(self.apiToken, email, key, type, waitTime)
      return res
    },
    trustedEA: async () => {
      const res = await userApi.EATrusted(self.apiToken)
      return res
    },
    grantedEA: async () => {
      const res = await userApi.EAGranted(self.apiToken)
      return res
    },
    yourTrustedActionEA: async (id: string, action: "reject" | "approve" | "reinvite") => {
      const res = await userApi.EAyourTrustedAction(self.apiToken, id, action)
      if (res.kind === "ok") {
        return true
      }
      return false
    },
    trustedYouActionEA: async (id: string, action: "accept" | "initiate") => {
      const res = await userApi.EATrustedYouAction(self.apiToken, id, action)
      if (res.kind === "ok") {
        return true
      }
      return false
    },
    takeoverEA: async (id: string) => {
      const res = await userApi.EATakeover(self.apiToken, id)
      return res
    },
    passwordEA: async (id: string, payload: any) => {
      const res = await userApi.EAPassword(self.apiToken, id, payload)
      return res
    },
    lockerPasswordEA: async (id: string, newPass: string) => {
      const res = await userApi.EALockerPassword(self.apiToken, id, newPass)
      return res
    },
    viewEA: async (id: string) => {
      const res = await userApi.EAView(self.apiToken, id)
      return res
    },
    removeEA: async (id: string) => {
      const res = await userApi.EARemove(self.apiToken, id)
      if (res.kind === "ok") {
        return true
      }
      return false
    },
    // business
    businessLoginMethod: async () => {
      const res = await idApi.businessLoginMethod()
      return res
    },
    // On Premise
    // user is on premise
    onPremisePreLogin: async (email: string) => {
      const res = await idApi.onPremisePreLogin(email)
      return res
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    purchaseValidation: async (
      receipt?: string,
      subscriptionId?: string,
      originalTransactionIdentifierIOS?: string,
    ) => {
      const res = await userApi.purchaseValidation(
        self.apiToken,
        receipt,
        subscriptionId,
        originalTransactionIdentifierIOS,
      )
      return res
    },
  }))
  .postProcessSnapshot(omit(["isLoggedInPw", "isMobileLangChange", "isPasswordlessLogin"]))

export interface User extends Instance<typeof UserModel> { }
export interface UserSnapshotOut extends SnapshotOut<typeof UserModel> { }
export interface UserSnapshotIn extends SnapshotIn<typeof UserModel> { }
export const createUserDefaultModel = () => types.optional(UserModel, {})

