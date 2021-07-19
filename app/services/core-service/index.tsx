import React from 'react';
import { CryptoService } from "../../../core/services"
import { MobileStorageService } from "./services/MobileStorageService"
import { SecureStorageService } from "./services/SecureStorageService"
import { MobileCryptoFunctionService } from "./services/MobileCryptoFunctionService"
import { MobilePlatformUtilsService } from "./services/MobilePlatformUtilsService"
import { MobileLogService } from "./services/MobileLogService"

const { createContext, useContext } = React

const CoreContext = createContext({})

export const CoreProvider = (props) => {
  const storageService = new MobileStorageService()
  const secureStorageService = new SecureStorageService()
  const cryptoFunctionService = new MobileCryptoFunctionService()
  const platformUtilsService = new MobilePlatformUtilsService()
  const logService = new MobileLogService()
  const cryptoService = new CryptoService(
    storageService,
    secureStorageService,
    cryptoFunctionService,
    platformUtilsService,
    logService
  )

  const services = {
    cryptoService,
    logService,
    platformUtilsService,
    storageService,
    secureStorageService,
    cryptoFunctionService
  }

  return (
    <CoreContext.Provider value={services}>
      {props.children}
    </CoreContext.Provider>
  )
}

export const useCoreService = () => useContext(CoreContext)
