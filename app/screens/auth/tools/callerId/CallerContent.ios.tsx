import { useTheme } from "@react-navigation/native"
import { Button, ImageIcon, Text, Toggle } from "app/components/cores"
import React from "react"
import { StyleSheet, View, Image } from "react-native"

// @ts-ignore
import { useCallerID } from "app/services/callerID/useCallerID"

const IOS_CALLER_ID_TUTORIAL = require("assets/images/ios-caller-id-setting.png")

export const CallerContent = () => {
  const { colors } = useTheme()
  const { isExtensionEnabled, openSettings, reloadExtension } = useCallerID()

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
              style={styles.mt12}
            />
            <Text
              text="To enable this feature, please follow the instructions below:"
              style={styles.mt12}
            />
            <View style={styles.mt12}>
              <Image source={IOS_CALLER_ID_TUTORIAL} resizeMode="contain" style={styles.image} />
              <Button text="Open Settings" onPress={openSettings} style={styles.mt12} />
            </View>
          </View>
        )}
        {isExtensionEnabled && (
          <View style={styles.mt12}>
            <Text text="40.000 numbers" />
            <Button text="Update List spams" onPress={reloadExtension} style={styles.mt12} />
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
  image: {
    alignSelf: "center",
    height: 300,
    width: 300,
  },
  mr12: {
    marginRight: 12,
  },
  mt12: {
    marginTop: 12,
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
