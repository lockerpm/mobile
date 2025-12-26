import { useState, useRef, useEffect, FC } from "react"
import { View, Image, Linking, AppState, StyleSheet } from "react-native"

import { Button, Header, Screen, Text } from "app/components/cores"
import { SettingsScreenProps } from "app/navigators"

import { isDeviceAutofillServiceEnabled } from "@/utils/autofill.android"

import { Step } from "./EnableAutofillStep"

const ACTIVE = require("assets/images/autofill/autofillActive.png")
const IOS_HINT = require("assets/images/autofill/IosHint.png")
const Key = require("assets/images/icons/autofill/key.png")
const Keyboard = require("assets/images/icons/autofill/keyboard.png")
const Locker = require("assets/images/icons/autofill/locker.png")
const Switch = require("assets/images/icons/autofill/switch.png")

export const AutofillServiceScreen: FC<SettingsScreenProps<"autofillService">> = ({
  navigation,
}) => {
  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)
  const [enabled, setEnabled] = useState(false)

  // ---------------------------EFFECT-----------------------
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setAppStateVisible(nextAppState)
    })
    return () => {
      subscription.remove()
    }
  }, [])

  useEffect(() => {
    isDeviceAutofillServiceEnabled().then((isActived) => {
      setEnabled(isActived)
    })
  }, [appStateVisible])

  return (
    <Screen
      safeAreaEdges={["bottom"]}
      header={
        !enabled ? (
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx={"settings:autofill_service"}
          />
        ) : undefined
      }
      footer={
        <Button
          tx={enabled ? "common:ok" : "common:open_settings"}
          onPress={() => {
            if (enabled) {
              navigation.navigate("mainTab", { screen: "homeTab" })
            } else {
              Linking.canOpenURL("App-prefs:root=General").then((supported) => {
                if (supported) {
                  Linking.openURL("App-prefs:root=General")
                }
              })
            }
          }}
          style={styles.ph16}
        />
      }
      contentContainerStyle={styles.container}
    >
      {enabled && (
        <View style={styles.center}>
          <Image resizeMode="cover" source={ACTIVE} style={styles.activeImage} />
          <View>
            <Text
              preset="bold"
              size="xl"
              tx={"autofill_service:activated.title"}
              style={styles.activeTitle}
            />
            <Text tx={"autofill_service:activated.content"} style={styles.textCenter} />
          </View>
        </View>
      )}
      {!enabled && (
        <View style={styles.center}>
          <Text preset="bold" text="Enable Password Autofill" />

          <Text
            text="Get your Locker information right where you need it, from the keyboard"
            style={styles.inactiveTitle}
          />
          <Image resizeMode="contain" source={IOS_HINT} style={styles.activeImage}></Image>
          <View>
            <Text text="Step-by-step, in Settings → Passwords:" style={styles.step} />
            <Step img={Keyboard} text="Tap on Autofill Passwords" />
            <Step img={Switch} text="Enable Autofill Passwords" />
            <Step img={Key} text="Important! Tap to disable Keychain" />
            <Step img={Locker} text="Tap to enable Locker" />
          </View>
        </View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  activeImage: {
    borderRadius: 16,
    height: 215,
    width: 250,
  },
  activeTitle: {
    marginVertical: 24,
    textAlign: "center",
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inactiveTitle: {
    marginBottom: 15,
    marginTop: 12,
    textAlign: "center",
  },
  ph16: {
    paddingHorizontal: 16,
  },
  step: {
    marginBottom: 10,
    marginTop: 25,
  },
  textCenter: {
    textAlign: "center",
  },
})
