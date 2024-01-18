import { Instance, SnapshotIn, SnapshotOut, types } from 'mobx-state-tree'
import { withSetPropAction } from '../helpers/withSetPropAction'
import { omit } from 'ramda'
import { AndroidAutofillServiceData } from 'app/utils/autofillHelper'
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
    isAndroidAutofillService: types.maybeNull(types.boolean),
    androidAutofillServiceData: types.maybeNull(types.frozen<AndroidAutofillServiceData>()),
    isDeeplinkShares: types.maybeNull(types.boolean),
    isDeeplinkEmergencyAccess: types.maybeNull(types.boolean),
    selectedCountry: types.maybeNull(types.string),
    isOffline: types.maybeNull(types.boolean),
    isSelecting: types.maybeNull(types.boolean),
    isPerformOverlayTask: types.maybeNull(types.boolean),
    hasNoMasterPwItem: types.maybeNull(types.boolean),
    isStartFromPasswordLess: types.maybeNull(types.boolean),

    isFromPassword: types.maybeNull(types.boolean),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setIsFromPassword: (val: boolean) => {
      self.isFromPassword = val
    },

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

    setIsDeeplinkEmergencyAccess(val: boolean) {
      self.isDeeplinkEmergencyAccess = val
    },

    setIsDeeplinkShares(val: boolean) {
      self.isDeeplinkShares = val
    },

    setIsAndroidAutofillService(val: boolean) {
      self.isAndroidAutofillService = val
    },

    setLockResendOtpResetPasswordTime(val: number) {
      self.lockResendOtpResetPasswordTime = val
    },

    setAndroidAutofillServiceData(isAutofillService: boolean, data: AndroidAutofillServiceData) {
      self.isAndroidAutofillService = isAutofillService
      self.androidAutofillServiceData = data
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .postProcessSnapshot(
    omit([
      'isSelecting',
      'isOffline',
      'isPerformOverlayTask',
      'selectedCountry',
      'hasNoMasterPwItem',
      'isDeeplinkShares',
      'isDeeplinkEmergencyAccess',
      'isStartFromPasswordLess',
      'isFromPassword',
      'isAndroidAutofillService',
      'androidAutofillServiceData',
    ])
  )

export interface UiStore extends Instance<typeof UiStoreModel> {}
export interface UiStoreSnapshotOut extends SnapshotOut<typeof UiStoreModel> {}
export interface UiStoreSnapshotIn extends SnapshotIn<typeof UiStoreModel> {}
export const createUiStoreDefaultModel = () => types.optional(UiStoreModel, {})
