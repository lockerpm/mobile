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

    // Cache
    selectedCountry: types.maybeNull(types.string),
    deepLinkAction: types.maybeNull(types.string),
    deepLinkAddDomain: types.maybeNull(types.string)
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setIsOffline: (isOffline: boolean) => {
      self.isOffline = isOffline
    },

    setIsDark: (isDark: boolean) => {
      self.isDark = isDark
      global.dark = true
    },

    setSelectedCountry(country_code: string) {
      self.selectedCountry = country_code
    },

    setDeepLinkAction(action: 'save' | 'add', data?: string) {
      self.deepLinkAction = action
      if (action === 'add') {
        self.deepLinkAddDomain = data || ''
      }
    },

    clearDeepLink() {
      self.deepLinkAction = null
      self.deepLinkAddDomain = null
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
