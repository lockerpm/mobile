import React, { useState, useRef, useEffect } from "react"
import { View, StyleProp, ViewStyle, TextInput } from "react-native"
import { PinItemInput } from "./PinItemInput"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "app/services/context"

interface PasscodeInputProps {
  onCodeFilled?: (code: string) => void
  style?: StyleProp<ViewStyle>
  /**
   * Reset error state when passcode input change
   */
  onTextChange?: () => void
  errorText?: string
  isLoading?: boolean
}

/**
 * Passcode Input use on set Pin and Confirm Pin Screen
 * Use navigation to set evemt, when user navigate to other screen, it will reset the passcode
 * @param param0
 * @returns
 */
export const PasscodeInput: React.FC<PasscodeInputProps> = ({
  errorText,
  onCodeFilled,
  style,
  onTextChange,
  isLoading,
}) => {
  const navigation = useNavigation()
  const { colors } = useTheme()

  const pinCount = 6
  const [passcode, setPasscode] = useState(Array(pinCount).fill(""))

  const inputRefs = useRef<Array<TextInput | null>>(Array(pinCount).fill(null))

  const handleInputChange = (index: number, text: string) => {
    if (!text) return
    console.log(index, text)
    onTextChange && onTextChange()
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
  }

  const handleKeyPress = () => {
    // Handle backspace (delete) key
    const newPasscode = Array(pinCount).fill("")
    if (onCodeFilled) {
      onCodeFilled("")
    }
    setPasscode(newPasscode)
    inputRefs.current[0]?.focus()
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 500)
    })
    return unsubscribe
  }, [navigation])

  return (
    <View>
      <View style={[$container, style]}>
        {passcode.map((digit, index) => (
          <>
            <PinItemInput
              editable={!isLoading}
              key={index}
              isError={!!errorText}
              ref={(ref) => (inputRefs.current[index] = ref)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace") {
                  handleKeyPress()
                }
              }}
              onChangeText={(text) => handleInputChange(index, text)}
              value={digit}
              maxLength={1}
              placeholder="0"
            />
            {index === 2 && (
              <View
                style={{
                  width: 12,
                  height: 5,
                  borderRadius: 2,
                  backgroundColor: colors.palette.neutral5,
                }}
              />
            )}
          </>
        ))}
      </View>
    </View>
  )
}

const $container: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  marginTop: 12,
}
