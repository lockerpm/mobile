import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const UiStoreModel = types
  .model("UiStore")
  .props({
    // Data
    isOffline: types.maybeNull(types.boolean),
    isDark: types.maybeNull(types.boolean),
    isSelecting: types.maybeNull(types.boolean),
    isPerformOverlayTask: types.maybeNull(types.boolean),
    lockResendOtpResetPasswordTime: types.maybeNull(types.number),

    // Cache
    isOnSaveLogin: types.maybeNull(types.boolean),
    isFromAutoFill: types.maybeNull(types.boolean),
    selectedCountry: types.maybeNull(types.string),
    deepLinkAction: types.maybeNull(types.string),
    deepLinkUrl: types.maybeNull(types.string),
    saveLogin: types.maybeNull(types.frozen({domain: types.string, username: types.string, password: types.string}))
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setIsOffline: (isOffline: boolean) => {
      self.isOffline = isOffline
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

    setSelectedCountry(country_code: string) {
      self.selectedCountry = country_code
    },

    setIsFromAutoFill(val: boolean) {
      self.isFromAutoFill = val
    },

    setIsOnSaveLogin(val: boolean) {
      self.isOnSaveLogin = val
    },

    setDeepLinkAction(action: 'fill' | 'save', data?: any) {
      self.deepLinkAction = action
      if (action === 'fill') {
        self.deepLinkUrl = data || ''
      } else {
        try {
          self.saveLogin = data
        } catch (error) {
          self.saveLogin = null
        } 
      }
    },

    clearDeepLink() {
      self.deepLinkAction = null
      self.deepLinkUrl = null
      self.saveLogin = null
    },

    setLockResendOtpResetPasswordTime(val: number) {
      self.lockResendOtpResetPasswordTime = val
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type UiStoreType = Instance<typeof UiStoreModel>
export interface UiStore extends UiStoreType {}
type UiStoreSnapshotType = SnapshotOut<typeof UiStoreModel>
export interface UiStoreSnapshot extends UiStoreSnapshotType {}
export const createUiStoreDefaultModel = () => types.optional(UiStoreModel, {})
