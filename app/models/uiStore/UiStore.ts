import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"
import { omit } from "ramda"
import { AndroidAutofillServiceData } from "app/utils/autofillHelper"
/**
 * Model description here for TypeScript hints.
 */
export const UiStoreModel = types
  .model("UiStore")
  .props({
    // Data
    isDark: types.maybeNull(types.boolean),
    isShowedAppInto: false,
    isShowedAppReview: false,
    inAppReviewShowDate: types.maybeNull(types.number),
    inAppNotiUnreadCount: types.maybeNull(types.number),

    // Cache
    isAndroidAutofillService: types.maybeNull(types.boolean),
    androidAutofillServiceData: types.maybeNull(types.frozen<AndroidAutofillServiceData>()),
    isOffline: types.maybeNull(types.boolean),
    hasNoMasterPwItem: types.maybeNull(types.boolean),
    isShowedPopupMarketing: types.maybeNull(types.boolean),
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

    setIsShowedPopupMarketing: (val: boolean) => {
      self.isShowedPopupMarketing = val
    },

    setIsShowedAppReview: (val: boolean) => {
      self.isShowedAppReview = val
    },
    setIsShowedAppIntro: (val: boolean) => {
      self.isShowedAppInto = val
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

    setIsAndroidAutofillService(val: boolean) {
      self.isAndroidAutofillService = val
    },

    setAndroidAutofillServiceData(isAutofillService: boolean, data: AndroidAutofillServiceData) {
      self.isAndroidAutofillService = isAutofillService
      self.androidAutofillServiceData = data
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .postProcessSnapshot(
    omit([
      "isOffline",
      "hasNoMasterPwItem",
      "isShowedPopupMarketing",
      "isStartFromPasswordLess",
      "isAndroidAutofillService",
      "androidAutofillServiceData",
    ]),
  )

export interface UiStore extends Instance<typeof UiStoreModel> {}
export interface UiStoreSnapshotOut extends SnapshotOut<typeof UiStoreModel> {}
export interface UiStoreSnapshotIn extends SnapshotIn<typeof UiStoreModel> {}
export const createUiStoreDefaultModel = () => types.optional(UiStoreModel, {})
