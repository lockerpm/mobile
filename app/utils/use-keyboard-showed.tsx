import { useEffect, useState } from "react"
import { Keyboard } from "react-native"
import { IS_IOS } from "../config/constants"


export function useKeyboardStatus() {
  const [isShowed, setIsShowed] = useState(true)

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      IS_IOS ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsShowed(false)
      }
    )
    const keyboardDidHideListener = Keyboard.addListener(
      IS_IOS ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsShowed(true)
      }
    )
    return () => {
      keyboardDidHideListener.remove()
      keyboardDidShowListener.remove()
    }
  }, [])

  return isShowed
}