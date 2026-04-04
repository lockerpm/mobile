import { FC, useCallback, useEffect, useRef, useState } from "react"
import { AppState } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import UserInactivity from "react-native-user-inactivity"

import { useStores } from "app/models"
import { AuthRoute, AppScreenProps, modalScreenOptions } from "app/navigators"
import { useCipherData } from "app/services/hook"
import { LockType } from "app/static/types"
import { AppEventType, EventBus } from "app/utils/eventBus"

import { ProtectSplashScreen } from "@/components/utils"
import { isAndroidAutofillService } from "@/utils/autofill.android"
import { Logger } from "@/utils/logger"
import { AppStorageKey, saveString } from "@/utils/storage"

import {
  AddCipherModalScreen,
  BrowseStack,
  AndroidAutofillStack,
  CipherActionsModalScreen,
  HomeStack,
  MarketingScreen,
  MenuStack,
  QRScannerScreen,
  TabNavigator,
  ToolStack,
} from "./screens"
import { useInAppReview } from "./useInAppReview"
import { useSocket } from "./useSocket"

const Stack = createNativeStackNavigator<AuthRoute>()

export const AuthStack: FC<AppScreenProps<"authStack">> = observer(
  ({
    navigation,
    route: {
      params: { fido2 },
    },
  }) => {
    const { syncAutofillData } = useCipherData()
    const { uiStore, user, cipherStore, toolStore } = useStores()

    // ------------------ PARAMS --------------------

    const prevAppState = useRef("")
    const transitionEnd = useRef(false)

    const [batchDecryptionEnded, setBatchDecryptionEnded] = useState(false)

    // hide app content when app is in background
    const [showProtect, setShowProtect] = useState(false)

    const isAndroidService = isAndroidAutofillService(fido2)
    const { handleSync, handleUserDataSync } = useSocket({ isAndroidService })
    // ------------------ METHODS --------------------

    // On app return from background -> lock? + sync autofill data + check push noti navigation
    const _handleAppStateChange = useCallback(
      async (nextAppState: string) => {
        Logger.debug(nextAppState)
        if (prevAppState.current === nextAppState) {
          return
        }
        prevAppState.current = nextAppState

        // Ohter state (background/inactive)
        if (nextAppState === "active") {
          setShowProtect(false)
          syncAutofillData()
        } else {
          setShowProtect(true)
        }
      },
      [syncAutofillData]
    )
    // App inactive trigger
    const handleInactive = async (isActive: boolean) => {
      if (!isActive && user.appTimeout > 0) {
        navigation.push("lock", {
          temporaryLock: true,
          type: LockType.Individual,
          fido2,
        })
      }
    }

    // ------------------ EFFECT --------------------

    useInAppReview()

    useEffect(() => {
      saveString(AppStorageKey.APP_CURRENT_USER_PW_ID, user.pwd_user_id ?? "")
    }, [user.pwd_user_id])

    // Check network to sync
    useEffect(() => {
      if (batchDecryptionEnded) {
        if (!uiStore.isOffline && user.isLoggedInPw) {
          handleSync()
        }
      }
    }, [uiStore.isOffline, user.isLoggedInPw, batchDecryptionEnded, handleSync])

    // Outdated data warning
    useEffect(() => {
      const subscription = AppState.addEventListener("change", _handleAppStateChange)

      const listenerPWUpdate = EventBus.createListener(AppEventType.PASSWORD_UPDATE, () => {
        toolStore.setLastHealthCheck(0)
      })
      const listenerBatchDecrypt = EventBus.createListener(AppEventType.NEW_BATCH_DECRYPTED, () => {
        cipherStore.setLastCacheUpdate()
      })
      const listenerAll = EventBus.createListener(AppEventType.DECRYPT_ALL_STATUS, (status) => {
        switch (status) {
          case "started":
            cipherStore.setIsBatchDecrypting(true)
            break
          case "ended":
            cipherStore.setIsBatchDecrypting(false)
            syncAutofillData()
            setBatchDecryptionEnded(true)
            break
        }
      })
      const unsubscribeNavigationEnd = navigation.addListener("transitionEnd", () => {
        if (!transitionEnd.current) {
          transitionEnd.current = true
          handleUserDataSync()
        }
      })

      return () => {
        subscription.remove()
        EventBus.removeListener(listenerBatchDecrypt)
        EventBus.removeListener(listenerAll)
        EventBus.removeListener(listenerPWUpdate)
        unsubscribeNavigationEnd()
      }
    }, [
      _handleAppStateChange,
      cipherStore,
      handleUserDataSync,
      navigation,
      syncAutofillData,
      toolStore,
    ])

    // ------------------ RENDER --------------------

    return (
      <>
        <UserInactivity
          timeForInactivity={user.appTimeout && user.appTimeout > 0 ? user.appTimeout : 1000}
          onAction={handleInactive}
        >
          <Stack.Navigator
            initialRouteName={isAndroidService ? "androidAutofillStack" : "mainTab"}
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="androidAutofillStack" component={AndroidAutofillStack} />
            <Stack.Screen name="browseStack" component={BrowseStack} />
            <Stack.Group screenOptions={modalScreenOptions}>
              <Stack.Screen name="cipherActionsModal" component={CipherActionsModalScreen} />
              <Stack.Screen name="addCipherModal" component={AddCipherModalScreen} />
              <Stack.Screen name="marketingModal" component={MarketingScreen} />
              <Stack.Screen name="qrScannerModal" component={QRScannerScreen} />
            </Stack.Group>
            <Stack.Screen name="mainTab" component={TabNavigator} />
            <Stack.Screen name="homeStack" component={HomeStack} />
            <Stack.Screen name="toolsStack" component={ToolStack} />
            <Stack.Screen name="menuStack" component={MenuStack} />
          </Stack.Navigator>
        </UserInactivity>
        <ProtectSplashScreen
          isOpen={showProtect}
          onClose={() => {
            setShowProtect(false)
          }}
        />
      </>
    )
  }
)
