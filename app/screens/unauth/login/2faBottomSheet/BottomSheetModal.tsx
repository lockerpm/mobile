import React, { useCallback, useEffect, useState } from "react"
import { View } from "react-native"
import { useTheme } from "app/services/context"
import { MethodSelection } from "./MethodSelection"
import { OtpAuthen } from "./OtpAuthen"
import Animated, { FadeInDown } from "react-native-reanimated"
import Modal from "react-native-modal"
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle"

interface Props {
  credential: {
    username: string
    password: string
    methods: {
      type: string
      data: any
    }[]
  }
  /**
   * Open Country picker bottom sheet
   */
  isOpen: boolean
  /**
   * Call back when sheet close
   */
  onClose: () => void

  // onPremise login dont need this prop
  onLoggedIn?: () => Promise<void>
}

export const TwoFAAuthenSheet = ({ credential, isOpen, onClose, onLoggedIn }: Props) => {
  const { colors } = useTheme()

  const [index, setIndex] = useState(1)
  const [method, setMethod] = useState("")
  const [partialEmail, setPartialEamil] = useState("")

  const $safeStyle = useSafeAreaInsetsStyle(["bottom"])

  const reset = useCallback(() => {
    setIndex(0)
    setMethod("")
    setPartialEamil("")
  }, [])

  useEffect(() => {
    if (!isOpen) reset()
  }, [isOpen])

  return (
    <Modal
      avoidKeyboard
      animationIn="slideInUp"
      animationOut="slideOutDown"
      isVisible={isOpen}
      onModalHide={onClose}
      onBackdropPress={onClose}
      style={{ margin: 0, justifyContent: "flex-end" }}
    >
      <View
        style={[
          {
            backgroundColor: colors.background,
            paddingHorizontal: 20,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            paddingTop: 12,
          },
          $safeStyle,
        ]}
      >
        {index === 0 && (
          <Animated.View entering={FadeInDown}>
            <MethodSelection
              methods={credential.methods}
              onSelect={(type: string, data: any) => {
                setMethod(type)
                setPartialEamil(data)
                setIndex(1)
              }}
              username={credential.username}
              password={credential.password}
            />
          </Animated.View>
        )}
        {index === 1 && (
          <Animated.View entering={FadeInDown}>
            <OtpAuthen
              goBack={() => setIndex(0)}
              method={method}
              email={partialEmail}
              username={credential.username}
              password={credential.password}
              onLoggedIn={() => {
                onClose()
                onLoggedIn()
              }}
            />
          </Animated.View>
        )}
      </View>
    </Modal>
  )
}
