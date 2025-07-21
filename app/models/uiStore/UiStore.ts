import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"
/**
 * Model description here for TypeScript hints.
 */
export const UiStoreModel = types
  .model("UiStore")
  .props({
    // Data
    isShowedAppInto: types.boolean,
    isShowedAppReview: types.boolean,
    inAppReviewShowDate: types.number,
    inAppNotiUnreadCount: types.number,

    isOffline: types.boolean,
    hasNoMasterPwItem: types.boolean,
    isShowedPopupMarketing: types.boolean,
    isStartFromPasswordLess: types.boolean,
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
  }))
  .postProcessSnapshot((snapShot) => {
    return {
      ...snapShot,
      isOffline: false,
      hasNoMasterPwItem: true,
      isShowedPopupMarketing: false,
      isStartFromPasswordLess: false,
    }
  })

export interface UiStore extends Instance<typeof UiStoreModel> {}
export interface UiStoreSnapshotOut extends SnapshotOut<typeof UiStoreModel> {}
export interface UiStoreSnapshotIn extends SnapshotIn<typeof UiStoreModel> {}
export const createUiStoreDefaultModel = () =>
  types.optional(UiStoreModel, {
    // Data
    isShowedAppInto: false,
    isShowedAppReview: false,
    inAppReviewShowDate: 0,
    inAppNotiUnreadCount: 0,

    // Cache
    isOffline: false,
    hasNoMasterPwItem: true,
    isShowedPopupMarketing: false,
    isStartFromPasswordLess: false,
  })
