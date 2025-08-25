/* eslint-disable no-restricted-imports */
import { useState, useRef, useEffect } from "react"
import { View, StyleProp, ViewStyle, TextInput } from "react-native"
import { PinItemInput } from "./PinItemInput"
import { useNavigation } from "@react-navigation/native"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

interface PasscodeInputProps {
  iniCode?: string
  onCodeFilled?: (code: string) => void
  style?: StyleProp<ViewStyle>
  /**
   * Reset error state when passcode input change
   */
  onTextChange?: () => void
  isError?: boolean
  isLoading?: boolean
}

/**
 * Passcode Input use on set Pin and Confirm Pin Screen
 * @param param0
 * @returns
 */

const pinCount = 6

export const PasscodeInput: React.FC<PasscodeInputProps> = ({
  iniCode,
  isError,
  onCodeFilled,
  style,
  onTextChange,
  isLoading,
}) => {
  const navigation = useNavigation()
  const { themed } = useAppTheme()

  const [passcode, setPasscode] = useState(Array(pinCount).fill(""))

  const inputRefs = useRef<Array<TextInput | null>>(Array(pinCount).fill(null))

  const handleInputChange = (index: number, text: string) => {
    if (!text) return
    if (onTextChange) {
      onTextChange()
    }

    if (text.length === 1) {
      // Update passcode array with the entered digit
      const newPasscode = passcode.slice()
      newPasscode[index] = text.toUpperCase()

      // Check if all inputs are filled

      const code = newPasscode.join("")
      if (onCodeFilled) {
        onCodeFilled(code)
      }

      setPasscode(newPasscode)

      // Move focus to the next input or submit if all inputs are filled
      if (index < pinCount - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    } else if (text.length === 2) {
      // Update passcode array with the entered digit
      const newPasscode = passcode.slice()
      const old = newPasscode[index]
      if (text[0] === old) {
        newPasscode[index] = text[1].toUpperCase()
      } else {
        newPasscode[index] = text[0].toUpperCase()
      }

      // Check if all inputs are filled

      const code = newPasscode.join("")
      if (onCodeFilled) {
        onCodeFilled(code)
      }

      setPasscode(newPasscode)

      // Move focus to the next input or submit if all inputs are filled
      if (index < pinCount - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    } else if (text.length >= 6) {
      // Update passcode array with the entered digit
      const newPasscode = text.slice(0, 6).toLocaleUpperCase()

      // Check if all inputs are filled
      if (onCodeFilled) {
        onCodeFilled(newPasscode)
      }

      setPasscode(newPasscode.split(""))
      inputRefs.current[5]?.focus()
    }
  }

  const handleKeyPress = (index: number) => {
    if (index > 0) {
      if (onTextChange) {
        onTextChange()
      }

      // Handle backspace (delete) key
      const newPasscode = passcode.slice()
      if (newPasscode[index] !== "") {
        newPasscode[index] = ""
      } else {
        newPasscode[index - 1] = ""
        inputRefs.current[index - 1]?.focus()
      }

      if (onCodeFilled) {
        onCodeFilled(newPasscode.join(""))
      }
      setPasscode(newPasscode)
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 500)
    })
    return unsubscribe
  }, [navigation])

  useEffect(() => {
    if (!!iniCode) {
      setPasscode(iniCode.split(""))
    }
  }, [iniCode])

  return (
    <View>
      <View style={[$container, style]}>
        {passcode.slice(0, 3).map((digit, index) => (
          <PinItemInput
            editable={!isLoading}
            key={index}
            isError={isError}
            ref={(ref) => (inputRefs.current[index] = ref)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace") {
                handleKeyPress(index)
              }
            }}
            onChangeText={(text) => handleInputChange(index, text)}
            value={digit}
            placeholder="0"
          />
        ))}
        <View style={themed($sperator)} />
        {passcode.slice(3).map((digit, index) => {
          const passcodeIndex = index + 3
          return (
            <PinItemInput
              editable={!isLoading}
              key={passcodeIndex}
              isError={isError}
              ref={(ref) => (inputRefs.current[passcodeIndex] = ref)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace") {
                  handleKeyPress(passcodeIndex)
                }
              }}
              onChangeText={(text) => handleInputChange(passcodeIndex, text)}
              value={digit}
              placeholder="0"
            />
          )
        })}
      </View>
    </View>
  )
}

const $sperator: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 12,
  height: 5,
  borderRadius: 2,
  backgroundColor: colors.palette.neutral5,
})

const $container: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  marginTop: 12,
}
