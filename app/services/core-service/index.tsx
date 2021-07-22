import React from 'react';
import { CryptoService, PasswordGenerationService, UserService, TokenService } from "../../../core/services"
import { PolicyService } from "../../../core/services/policy.service"
import { MobileStorageService } from "./services/MobileStorageService"
import { SecureStorageService } from "./services/SecureStorageService"
import { MobileCryptoFunctionService } from "./services/MobileCryptoFunctionService"
import { MobilePlatformUtilsService } from "./services/MobilePlatformUtilsService"
import { MobileLogService } from "./services/MobileLogService"

const { createContext, useContext } = React

const storageService = new MobileStorageService()
const secureStorageService = new SecureStorageService()
const cryptoFunctionService = new MobileCryptoFunctionService()
const platformUtilsService = new MobilePlatformUtilsService()
const logService = new MobileLogService()

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
  policyService
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
