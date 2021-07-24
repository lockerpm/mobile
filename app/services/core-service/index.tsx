import React from 'react';
import { NativeModules, Platform } from 'react-native';
import { 
  CryptoService, PasswordGenerationService, UserService, TokenService, AuthService, ApiService,
  AppIdService, I18nService, VaultTimeoutService, CipherService, SettingsService, FolderService,
  CollectionService
} from "../../../core/services"
import { PolicyService } from "../../../core/services/policy.service"
import { FileUploadService } from "../../../core/services/fileUpload.service"
import { SearchService } from "../../../core/services/search.service"
import { ConsoleLogService } from "../../../core/services/consoleLog.service"
import { 
  MobileStorageService, SecureStorageService, MobileCryptoFunctionService, MobilePlatformUtilsService,
  MobileLogService, MobileMessagingService
} from './services'

const { createContext, useContext } = React

const localesDirectory = '../../i18n'
const deviceLanguage = Platform.OS === 'ios'
  ? NativeModules.SettingsManager.settings.AppleLocale 
    || NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
  : NativeModules.I18nManager.localeIdentifier;

// Simple services
const storageService = new MobileStorageService()
const secureStorageService = new SecureStorageService()
const cryptoFunctionService = new MobileCryptoFunctionService()
const platformUtilsService = new MobilePlatformUtilsService()
const logService = new MobileLogService()
const messagingService = new MobileMessagingService()
const i18nService = new I18nService(deviceLanguage, localesDirectory, (formattedLocale : string) => {
  return new Promise((resolve) => {
    const filePath = `${localesDirectory}/${formattedLocale}.json`
    let res = {}
    try {
      res = require(filePath)
    } catch(e) {
      console.log(`Cannot find locale ${formattedLocale}, default to EN`)
      res = require(`${localesDirectory}/en.json`)
    }
    resolve(res)
  })
})
const consoleLogService = new ConsoleLogService(__DEV__)

// Dependency injected services
const tokenService = new TokenService(storageService)
const userService = new UserService(tokenService, storageService)
const policyService = new PolicyService(userService, storageService)
const cryptoService = new CryptoService(
  storageService,
  secureStorageService,
  cryptoFunctionService,
  platformUtilsService,
  logService
)
const passwordGenerationService = new PasswordGenerationService(
  cryptoService,
  storageService,
  policyService
)
const apiService = new ApiService(
  tokenService,
  platformUtilsService,
  (expired: boolean) => {
    return new Promise((resolve) => {
      resolve(null)
    })
  }
)
const appIdService = new AppIdService(storageService)
const settingsService = new SettingsService(userService, storageService)
const fileUploadService = new FileUploadService(logService, apiService)
const cipherService = new CipherService(
  cryptoService,
  userService,
  settingsService,
  apiService,
  fileUploadService,
  storageService,
  i18nService,
  () => searchService
)
const searchService =  new SearchService(
  cipherService,
  logService,
  i18nService
)
const folderService = new FolderService(
  cryptoService,
  userService,
  apiService, 
  storageService,
  i18nService,
  cipherService
)
const collectionService = new CollectionService(
  cryptoService,
  userService,
  storageService,
  i18nService
)
const vaultTimeoutService = new VaultTimeoutService(
  cipherService,
  folderService,
  collectionService,
  cryptoService,
  platformUtilsService,
  storageService,
  messagingService,
  searchService,
  userService,
  tokenService,
  () => {
    console.log('Vault timeout locked callback')
    return Promise.resolve(null)
  },
  () => {
    console.log('Vault timeout logged out callback')
    return Promise.resolve(null)
  }
)
const authService = new AuthService(
  cryptoService,
  apiService,
  userService,
  tokenService,
  appIdService,
  i18nService,
  platformUtilsService,
  messagingService,
  vaultTimeoutService,
  consoleLogService
)

// All services to be used
const services = {
  cryptoService,
  logService,
  platformUtilsService,
  storageService,
  secureStorageService,
  cryptoFunctionService,
  passwordGenerationService,
  tokenService,
  userService,
  policyService,
  authService
}

const CoreContext = createContext(services)

// export const CoreProvider = (props) => {
//   return (
//     <CoreContext.Provider value={services}>
//       {props.children}
//     </CoreContext.Provider>
//   )
// }

export const useCoreService = () => useContext(CoreContext)
