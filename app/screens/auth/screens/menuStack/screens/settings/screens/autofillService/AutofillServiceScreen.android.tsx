/* eslint-disable react-native/no-inline-styles */
import { useState, useEffect, useRef, FC } from "react"
import {
  NativeModules,
  Image,
  View,
  AppState,
  StyleSheet,
  Platform,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native"
import { observer } from "mobx-react-lite"

import { Header, Screen, Switch, Text } from "app/components/cores"
import { SettingsScreenProps } from "app/navigators"

import { MenuItemContainer, SettingsItem } from "@/components/utils"
import { useAppLocale } from "@/i18n"
import {
  isDeviceAutofillServiceEnabled,
  isChromeAutofillServiceEnabled,
  openChromeAutofillSettings,
  isChromeInstalled,
} from "@/utils/autofill.android"
import { useAppTheme } from "@/utils/useAppTheme"

const HINT = require("assets/images/autofill/androidHint.png")

const { RNAutofillServiceAndroid } = NativeModules

export const AutofillServiceScreen: FC<SettingsScreenProps<"autofillService">> = observer(
  ({ navigation }) => {
    const { translate } = useAppLocale()
    const {
      theme: { colors },
    } = useAppTheme()

    // ---------------------- STATES ----------------------
    const [deviceEnabled, setDeviceEnabled] = useState(false)
    const [chromeEnabled, setChromeEnabled] = useState(false)
    const [chromeAvailable, setChromeAvailable] = useState(false)

    const appState = useRef(AppState.currentState)
    const [appStateVisible, setAppStateVisible] = useState(appState.current)
    // ---------------------- COMPUTED ----------------------
    const api = Platform.OS === "android" ? Platform.Version : 0
    // ---------------------- METHODS ----------------------
    const requestAutofill = async () => {
      RNAutofillServiceAndroid.openAutofillSettings()
    }

    const checkAutofillEnabled = async () => {
      const checkDevice = await isDeviceAutofillServiceEnabled()
      setDeviceEnabled(checkDevice)
      const checkChromeInstalled = await isChromeInstalled()
      setChromeAvailable(checkChromeInstalled)
      if (checkChromeInstalled) {
        const checkChrome = await isChromeAutofillServiceEnabled()
        setChromeEnabled(checkChrome)
      }
    }

    useEffect(() => {
      const sub = AppState.addEventListener("change", (state) => {
        setAppStateVisible(state)
      })
      return () => sub.remove()
    }, [])

    useEffect(() => {
      checkAutofillEnabled()
    }, [appStateVisible])

    return (
      <Screen
        safeAreaEdges={["bottom"]}
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx={"settings:autofill_service"}
          />
        }
        contentContainerStyle={[styles.container, { backgroundColor: colors.block }]}
      >
        <MenuItemContainer>
          <SettingsItem
            disabled={deviceEnabled && api < 26}
            textTx={"autofill_service:android.android_autofill.name"}
            onPress={requestAutofill}
            RightAccessory={<Switch value={deviceEnabled} onPress={requestAutofill} />}
          />
          {!deviceEnabled && (
            <TouchableOpacity onPress={requestAutofill}>
              <AutofillServiceRender
                desc={translate("autofill_service:android.android_autofill.desc")}
                image={HINT}
              />
            </TouchableOpacity>
          )}
        </MenuItemContainer>

        {chromeAvailable && (
          <MenuItemContainer>
            <SettingsItem
              disabled={chromeEnabled && api < 26}
              textTx={"autofill_service:android.android_autofill.chrome_name"}
              onPress={openChromeAutofillSettings}
              RightAccessory={<Switch value={chromeEnabled} onPress={openChromeAutofillSettings} />}
            />
            {!chromeEnabled && (
              <TouchableOpacity onPress={openChromeAutofillSettings}>
                <AutofillServiceRender
                  desc={translate("autofill_service:android.android_autofill.chrome_desc")}
                />
              </TouchableOpacity>
            )}
          </MenuItemContainer>
        )}
      </Screen>
    )
  }
)

const AutofillServiceRender = ({ desc, image }: { desc: string; image?: ImageSourcePropType }) => {
  return (
    <View style={styles.centerView}>
      {image && <Image source={image} style={styles.unactiveImage} resizeMode="contain" />}
      <Text text={desc} style={styles.centerText} size="xs" />
    </View>
  )
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },
  centerView: {
    alignItems: "center",
    padding: 16,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  unactiveImage: {
    height: 227,
    marginBottom: 16,
    width: 335,
  },
})
