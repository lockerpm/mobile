import { useCallback, useEffect, useRef, useState } from "react"
import { AppState } from "react-native"

import { callerID } from "app/services/callerID/CallerID"

import { useStores } from "@/models"
import { AnalyticEvents, logFirebaseEvent } from "@/utils/analytics"

export const useCallerID = () => {
  const { user } = useStores()
  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)
  const [isExtensionEnabled, setIsExtensionEnabled] = useState(false)
  // ---------------------------METHOD-----------------------

  const checkIosCallerExtension = async () => {
    const isEnabled = await callerID.iosCheckExtensionIsEnabled()
    setIsExtensionEnabled(isEnabled)
  }

  const openSettings = useCallback(async () => {
    await callerID.iosOpenSetting()
    logFirebaseEvent(AnalyticEvents.SCAM_ENABLE_CALLERID, user.email)
  }, [])

  // ---------------------------EFFECT-----------------------
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setAppStateVisible(nextAppState)
    })
    return () => {
      subscription.remove()
    }
  }, [])

  useEffect(() => {
    checkIosCallerExtension()
  }, [appStateVisible])

  return {
    isExtensionEnabled,
    openSettings,
    refreshService: callerID.iosRefreshPIRParameters,
    resetService: callerID.iosResetExtension,
  }
}
