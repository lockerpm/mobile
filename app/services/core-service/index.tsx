import React from 'react';
import { NativeModules, Platform } from 'react-native';
import { 
  CryptoService, PasswordGenerationService, UserService, TokenService, AuthService, ApiService,
  AppIdService, I18nService, VaultTimeoutService, CipherService, SettingsService, FolderService,
  CollectionService, SyncService, ContainerService, AuditService,
} from "../../../core/services"
import { PolicyService } from "../../../core/services/policy.service"
import { FileUploadService } from "../../../core/services/fileUpload.service"
import { SearchService } from "../../../core/services/search.service"
import { SendService } from "../../../core/services/send.service"
import { ExportService } from "../../../core/services/export.service"
import { ImportService } from "../../../core/services/import.service"
import { 
  MobileStorageService, SecureStorageService, MobileCryptoFunctionService, MobilePlatformUtilsService,
  MobileLogService, MobileMessagingService
} from './services'
import en from "../../i18n/en.json"
import vi from "../../i18n/vi.json"

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
    const localeJson = formattedLocale.toLowerCase() === 'vi' ? vi : en
    resolve(localeJson)
  })
})

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
    return Promise.resolve(null)
  },
  () => {
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
  logService
)
const sendService = new SendService(
  cryptoService,
  userService,
  apiService,
  fileUploadService,
  storageService,
  i18nService,
  cryptoFunctionService
)
const syncService = new SyncService(
  userService,
  apiService,
  settingsService,
  folderService,
  cipherService,
  cryptoService,
  collectionService,
  storageService,
  messagingService,
  policyService,
  sendService,
  (expired: boolean) => {
    return new Promise((resolve) => {
      resolve(null)
    })
  }
)
const containerService = new ContainerService(cryptoService)
containerService.attachToGlobal(global)
const auditService = new AuditService(cryptoFunctionService, apiService)
const exportService = new ExportService(folderService, cipherService, apiService, cryptoService)
const importService = new ImportService(cipherService, folderService, apiService, i18nService, collectionService, platformUtilsService, cryptoService)

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
  authService,
  folderService,
  cipherService,
  searchService,
  collectionService,
  messagingService,
  syncService,
  containerService,
  auditService,
  exportService,
  importService
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
