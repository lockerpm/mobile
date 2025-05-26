import React, { useCallback, useMemo, useRef, useState } from 'react'
import BottomSheet from '@gorhom/bottom-sheet'
import { View, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { useTheme } from 'app/services/context'
import { MethodSelection } from './MethodSelection'
import { OtpAuthen } from './OtpAuthen'
import Animated, { FadeInDown } from 'react-native-reanimated'

interface Props {
  methods: {
    type: string
    data: any
  }[]
  setToken: (val: string) => void
  /**
   * Open Country picker bottom sheet
   */
  isOpen: boolean
  /**
   * Call back when sheet close
   */
  onClose: () => void
}

export const MethodSelectSheet = ({ methods, isOpen, onClose, setToken }: Props) => {
  const { colors } = useTheme()

  const [index, setIndex] = useState(0)
  const [username, setUsername] = useState('')
  // ref
  const sheetRef = useRef<BottomSheet>(null)

  // variables
  const snapPoints = useMemo(() => ['40%', '80%'], [])

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
          backdropComponent={() => (
            <TouchableWithoutFeedback onPress={closeSheet} style={{ flex: 1 }}>
              <View style={{ flex: 1, backgroundColor: colors.transparentModal }} />
            </TouchableWithoutFeedback>
          )}
        >
          <View
            style={{
              paddingHorizontal: 20,
            }}
          >
            {index === 0 && (
              <Animated.View entering={FadeInDown}>
                <MethodSelection
                  methods={methods}
                  onSelect={(type: string, data: any) => {
                    setUsername(data[0])
                    setIndex(1)
                    showFullSheet()
                  }}
                />
              </Animated.View>
            )}
            {index === 1 && (
              <Animated.View entering={FadeInDown}>
                <OtpAuthen
                  goBack={() => setIndex(0)}
                  username={username}
                  nextStep={(token: string) => {
                    setToken(token)
                    closeSheet()
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
