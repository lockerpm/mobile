import { Instance, SnapshotIn, SnapshotOut, types } from 'mobx-state-tree'
import { withSetPropAction } from '../helpers/withSetPropAction'
import { omit } from 'ramda'
/**
 * Model description here for TypeScript hints.
 */
export const UiStoreModel = types
  .model('UiStore')
  .props({
    // Data
    isDark: types.maybeNull(types.boolean),
    lockResendOtpResetPasswordTime: types.maybeNull(types.number),
    isShowedAppReview: false,
    inAppReviewShowDate: types.maybeNull(types.number),
    inAppNotiUnreadCount: types.maybeNull(types.number),

    // Cache
    isDeeplinkShares: types.maybeNull(types.boolean),
    isDeeplinkEmergencyAccess: types.maybeNull(types.boolean),
    isFromAutoFillItem: types.maybeNull(types.boolean),
    isOnSaveLogin: types.maybeNull(types.boolean),
    isFromAutoFill: types.maybeNull(types.boolean),
    selectedCountry: types.maybeNull(types.string),
    deepLinkAction: types.maybeNull(types.string),
    deepLinkUrl: types.maybeNull(types.string),
    saveLogin: types.maybeNull(
      types.frozen<{ domain: string; username: string; password: string }>()
    ),
    saveLastId: types.maybeNull(types.string),
    isOffline: types.maybeNull(types.boolean),
    isSelecting: types.maybeNull(types.boolean),
    isPerformOverlayTask: types.maybeNull(types.boolean),
    hasNoMasterPwItem: types.maybeNull(types.boolean),
    isStartFromPasswordLess: types.maybeNull(types.boolean),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setStartFromPasswordLess: (val: boolean) => {
      self.isStartFromPasswordLess = val
    },

    setHasNoMasterPwItem: (val: boolean) => {
      self.hasNoMasterPwItem = val
    },

    setIsOffline: (isOffline: boolean) => {
      self.isOffline = isOffline
    },

    setIsShowedAppReview: (val: boolean) => {
      self.isShowedAppReview = val
    },

    setInAppReviewShowDate: (val: number) => {
      self.inAppReviewShowDate = val
    },

    setShowedAppReview: (val: number) => {
      self.inAppReviewShowDate = val
    },

    setIsDark: (isDark: boolean) => {
      self.isDark = isDark
    },

    setIsSelecting: (isSelecting: boolean) => {
      self.isSelecting = isSelecting
    },

    setIsPerformOverlayTask: (isPerformOverlayTask: boolean) => {
      self.isPerformOverlayTask = isPerformOverlayTask
    },

    setSelectedCountry(countryCode: string) {
      self.selectedCountry = countryCode
    },

    setIsFromAutoFill(val: boolean) {
      self.isFromAutoFill = val
    },

    setIsDeeplinkEmergencyAccess(val: boolean) {
      self.isDeeplinkEmergencyAccess = val
    },

    setIsDeeplinkShares(val: boolean) {
      self.isDeeplinkShares = val
    },

    setIsOnSaveLogin(val: boolean) {
      self.isOnSaveLogin = val
    },

    setIsFromAutoFillItem(val: boolean) {
      self.isFromAutoFillItem = val
    },

    setDeepLinkAction(action: 'fill' | 'save' | 'fill_item', data?: any) {
      self.deepLinkAction = action
      if (action === 'fill') {
        self.deepLinkUrl = data || ''
      } else if (action === 'fill_item') {
        self.saveLastId = data || ''
      } else {
        self.saveLogin = data
      }
    },

    clearDeepLink() {
      self.deepLinkAction = null
      self.deepLinkUrl = null
      self.saveLogin = null
    },

    setLockResendOtpResetPasswordTime(val: number) {
      self.lockResendOtpResetPasswordTime = val
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .postProcessSnapshot(
    omit([
      'isSelecting',
      'isOffline',
      'isPerformOverlayTask',
      'isFromAutoFillItem',
      'isOnSaveLogin',
      'selectedCountry',
      'deepLinkAction',
      'deepLinkUrl',
      'saveLogin',
      'saveLastId',
      'hasNoMasterPwItem',
      'isDeeplinkShares',
      'isDeeplinkEmergencyAccess',
      'isStartFromPasswordLess',
    ])
  )

export interface UiStore extends Instance<typeof UiStoreModel> {}
export interface UiStoreSnapshotOut extends SnapshotOut<typeof UiStoreModel> {}
export interface UiStoreSnapshotIn extends SnapshotIn<typeof UiStoreModel> {}
export const createUiStoreDefaultModel = () => types.optional(UiStoreModel, {})
