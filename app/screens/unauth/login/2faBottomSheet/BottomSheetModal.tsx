import React, { useCallback, useMemo, useRef, useState } from "react"
import BottomSheet from "@gorhom/bottom-sheet"
import { View, Modal, TouchableWithoutFeedback, Keyboard } from "react-native"
import { useTheme } from "app/services/context"
import { MethodSelection } from "./MethodSelection"
import { OtpAuthen } from "./OtpAuthen"
import Animated, { FadeInDown } from "react-native-reanimated"

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

  const [index, setIndex] = useState(0)
  const [method, setMethod] = useState("")
  const [partialEmail, setPartialEamil] = useState("")

  // ref
  const sheetRef = useRef<BottomSheet>(null)

  // variables
  const snapPoints = useMemo(() => ["40%", "80%"], [])

  const showFullSheet = useCallback(() => {
    sheetRef.current?.snapToIndex(1)
  }, [])

  const closeSheet = useCallback(() => {
    sheetRef.current?.close()
    Keyboard.dismiss()
    setTimeout(onClose, 200)
  }, [])

  const onSheetChange = useCallback((index: number) => {
    if (index === 0) {
      Keyboard.dismiss()
    }
  }, [])

  return (
    <Modal transparent animationType="fade" visible={isOpen}>
      <View
        style={{
          flex: 1,
        }}
      >
        <BottomSheet
          index={0}
          ref={sheetRef}
          snapPoints={snapPoints}
          onClose={onClose}
          onChange={onSheetChange}
          enablePanDownToClose
          handleStyle={{
            backgroundColor: colors.background,
          }}
          backdropComponent={() => (
            <TouchableWithoutFeedback onPress={closeSheet} style={{ flex: 1 }}>
              <View style={{ flex: 1, backgroundColor: colors.transparentModal }} />
            </TouchableWithoutFeedback>
          )}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: colors.background,
              paddingHorizontal: 20,
            }}
          >
            {index === 0 && (
              <Animated.View entering={FadeInDown}>
                <MethodSelection
                  methods={credential.methods}
                  onSelect={(type: string, data: any) => {
                    setMethod(type)
                    setPartialEamil(data)
                    setIndex(1)
                    showFullSheet()
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
                    closeSheet()
                    onLoggedIn()
                  }}
                />
              </Animated.View>
            )}
          </View>
        </BottomSheet>
      </View>
    </Modal>
  )
}
