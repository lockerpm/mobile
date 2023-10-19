import React, { useCallback, useMemo, useRef } from 'react'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { View, TouchableWithoutFeedback } from 'react-native'
import { useTheme } from 'app/services/context'
import { Modal } from 'react-native-ui-lib'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { gestureHandlerRootHOC } from 'react-native-gesture-handler'

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
  itemHeight?: number
}

export const ActionSheet = ({ isOpen, onClose, children, header, itemHeight = 64 }: Props) => {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  // ref
  const sheetRef = useRef<BottomSheet>(null)
  const initHeight = useMemo(() => {
    if (header) return '40%'
    if (Array.isArray(children)) {
      const length = children.length
      if (length > 5) return '40%'
      else return length * itemHeight + insets.bottom + 40
    }
    return '40%'
  }, [])

  // variables
  const snapPoints = useMemo(() => [initHeight, '70%'], [])

  const closeSheet = useCallback(() => {
    sheetRef.current?.close()
    setTimeout(onClose, 200)
  }, [])

  const BottomSheetContent = gestureHandlerRootHOC(() => {
    return (
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
    )
  })
  return (
    <Modal transparent animationType="fade" visible={isOpen} onDismiss={onClose}>
      <BottomSheetContent />
    </Modal>
  )
}
