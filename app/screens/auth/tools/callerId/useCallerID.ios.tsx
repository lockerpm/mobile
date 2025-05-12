import { callerID } from "app/services/callerID/CallerID"
import { useEffect, useRef, useState } from "react"
import { AppState } from "react-native"

export const useCallerID = () => {
  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)
  const [isExtensionEnabled, setIsExtensionEnabled] = useState(false)

  // ---------------------------METHOD-----------------------

  const checkIosCallerExtension = async () => {
    const isEnabled = await callerID.iosCheckExtensionIsEnabled()
    setIsExtensionEnabled(isEnabled)
  }

  // const reloadExtension = useCallback(async () => {
  //   await callerID.iosProcessAndSaveCSV()
  // }, [isExtensionEnabled])

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
  }
}
