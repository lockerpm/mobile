import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { View, TouchableWithoutFeedback } from 'react-native'
import { useTheme } from 'app/services/context'
import { Modal } from 'react-native-ui-lib'

interface Props {
  /**
   * Open Country picker bottom sheet
   */
  isOpen: boolean
  /**
   * Call back when sheet close
   */
  onClose: () => void

  header?: React.ReactNode
  children?: React.ReactNode | React.ReactNode[]
}

export const ActionSheet = ({ isOpen, onClose, children, header }: Props) => {
  const { colors } = useTheme()

  // ref
  const sheetRef = useRef<BottomSheet>(null)

  // variables
  const snapPoints = useMemo(() => ['40%', '70%'], [])

  const showSheet = useCallback(() => {
    sheetRef.current?.snapToIndex(0)
  }, [])

  const closeSheet = useCallback(() => {
    sheetRef.current?.close()
    setTimeout(onClose, 200)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(showSheet, 200)
    }
  }, [isOpen])

  return (
    <Modal transparent animationType="fade" visible={isOpen}>
      <View
        style={{
          flex: 1,
        }}
      >
        <BottomSheet
          index={-1}
          ref={sheetRef}
          snapPoints={snapPoints}
          onClose={onClose}
          enablePanDownToClose
          backdropComponent={() => (
            <TouchableWithoutFeedback onPress={closeSheet} style={{ flex: 1 }}>
              <View style={{ flex: 1, backgroundColor: colors.transparentModal }} />
            </TouchableWithoutFeedback>
          )}
        >
          {header}
          <BottomSheetScrollView>
            {React.Children.map(children, (child, index) => {
              return (
                <View
                  key={index}
                  style={{
                    borderBottomColor: colors.border,
                    borderBottomWidth: 1,
                  }}
                >
                  {child}
                </View>
              )
            })}
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </Modal>
  )
}
