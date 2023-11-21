import React, { useCallback, useMemo, useRef } from "react"
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet"
import { View, TouchableWithoutFeedback, Modal, StyleSheet, Platform } from "react-native"
import { useTheme } from "app/services/context"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { gestureHandlerRootHOC } from "react-native-gesture-handler"
import { BlurView } from "@react-native-community/blur"

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
              <BlurView
                blurType={Platform.OS === "ios" ? "ultraThinMaterialDark" : "dark"}
                blurAmount={0}
                // @ts-ignore
                blurRadius={10}
                overlayColor="rgba(0,0,0,0.1)"
                style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.transparent }]}
              />
            </TouchableWithoutFeedback>
          )}
          handleComponent={() => (
            <View
              style={{
                paddingVertical: 4,
                justifyContent: "center",
                alignItems: "center",
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              }}
            >
              <View
                style={{
                  marginVertical: 5,
                  height: 4,
                  borderRadius: 2,
                  width: 50,
                  backgroundColor: colors.primaryText,
                }}
              />
            </View>
          )}
          backgroundStyle={{
            backgroundColor: colors.background,
          }}
        >
          {header}

          <BottomSheetScrollView
            contentContainerStyle={{
              paddingBottom: insets.bottom,
              backgroundColor: colors.background,
            }}
          >
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
