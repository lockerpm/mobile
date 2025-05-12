import { useTheme } from "@react-navigation/native"
import { Button, ImageIcon, Text, Toggle } from "app/components/cores"
import React from "react"
import { StyleSheet, View } from "react-native"

// @ts-ignore
import { useCallerID } from "./useCallerID"

const LiveCallerLookUp = () => {
  const { colors } = useTheme()
  const { isEnabledOverlayPermission, requestPermission } = useCallerID()

  return (
    <View style={styles.container}>
      <View style={[styles.content, { borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.rowShrink}>
            <ImageIcon icon="phone-list" containerStyle={styles.mr12} size={32} />
            <Text text="Live Call lookup" />
          </View>
          <Toggle variant="switch" value={isEnabledOverlayPermission} />
        </View>
        {!isEnabledOverlayPermission && (
          <View>
            <Text
              text="Live Call look up is a feature that allows you to identify the caller's name when the phone is ringing."
              style={{ marginTop: 12 }}
            />
            <Text
              text="To enable this feature, please follow the allow locker to :"
              style={{ marginTop: 12 }}
            />
            <View style={{ marginTop: 12 }}>
              <Button text="Open Settings" onPress={requestPermission} style={{ marginTop: 12 }} />
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

export const CallerContent = () => {
  return (
    <View>
      <LiveCallerLookUp />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  content: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  mr12: {
    marginRight: 12,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  rowShrink: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
  },
})
