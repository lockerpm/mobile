import React, { useCallback, useMemo, useRef } from "react"
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet"
import { View, TouchableWithoutFeedback, Modal } from "react-native"
import { useTheme } from "app/services/context"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { gestureHandlerRootHOC } from "react-native-gesture-handler"

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

  const childernLength = Array.isArray(children) ? children.length : 0

  const initHeight = useMemo(() => {
    if (header) return "40%"
    if (Array.isArray(children)) {
      const length = children.length
      if (length > 5) return "40%"
      else return length * itemHeight + insets.bottom + 40
    }
    return "40%"
  }, [])

  // variables
  const snapPoints = useMemo(() => [initHeight, "70%"], [])

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
          <BottomSheetScrollView contentContainerStyle={{ paddingBottom: insets.bottom }}>
            {React.Children.map(children, (child, index) => {
              return (
                <View
                  key={index}
                  style={{
                    borderBottomColor: colors.border,
                    borderBottomWidth: index !== childernLength - 1 ? 1 : 0,
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
    <Modal
      transparent
      animationType="fade"
      visible={isOpen}
      onDismiss={onClose}
      onRequestClose={onClose}
    >
      <BottomSheetContent />
    </Modal>
  )
}
