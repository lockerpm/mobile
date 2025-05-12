import { useTheme } from "@react-navigation/native"
import { Button, ImageIcon, Text, Toggle } from "app/components/cores"
import React from "react"
import { StyleSheet, View, Image, Linking } from "react-native"

// @ts-ignore
import { useCallerID } from "./useCallerID"

const IOS_CALLER_ID_TUTORIAL = require("assets/images/ios-caller-id-setting.png")

export const CallerContent = () => {
  const { colors } = useTheme()
  const { isExtensionEnabled } = useCallerID()

  return (
    <View style={styles.container}>
      <View style={[styles.content, { borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.rowShrink}>
            <ImageIcon icon="phone-list" containerStyle={styles.mr12} size={32} />
            <Text text="Call Logs lookup" />
          </View>
          <Toggle variant="switch" value={isExtensionEnabled} />
        </View>
        {!isExtensionEnabled && (
          <View>
            <Text
              text="Caller ID is a feature that allows you to identify the caller's name and label it below callog ."
              style={{ marginTop: 12 }}
            />
            <Text
              text="To enable this feature, please follow the instructions below:"
              style={{ marginTop: 12 }}
            />
            <View style={{ marginTop: 12 }}>
              <Image
                source={IOS_CALLER_ID_TUTORIAL}
                resizeMode="contain"
                style={{
                  alignSelf: "center",
                  width: 300,
                  height: 300,
                }}
              />
              <Button
                text="Open Settings"
                onPress={() => {
                  Linking.openSettings()
                }}
                style={{ marginTop: 12 }}
              />
            </View>
          </View>
        )}
        {isExtensionEnabled && (
          <View style={{ marginTop: 12 }}>
            <Text text="Mores then 30.000 numbers" />
            <Button
              text="Download List spams"
              onPress={() => {
                Linking.openSettings()
              }}
              style={{ marginTop: 12 }}
            />
          </View>
        )}
      </View>
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
