/* eslint-disable react-native/no-inline-styles */
import { useState, useEffect, useRef, FC } from "react"
import { NativeModules, Image, View, AppState, StyleSheet } from "react-native"

import { getApiLevel, getManufacturer } from "react-native-device-info"
import { AutofillServiceEnabled } from "app/utils/autofillHelper"
import { Button, Header, Screen, Text } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { SettingsScreenProps } from "app/navigators"
import { useAppLocale } from "@/i18n"

const HINT = require("assets/images/autofill/androidHint.png")
const PER = require("assets/images/autofill/otherXiaomiPermission.png")
const ACTIVE = require("assets/images/autofill/autofillActive.png")

const { RNManufacturerSettings, RNAutofillServiceAndroid } = NativeModules

type ItemType = {
  key: string
  title: string
  header: string
  desc: string
  image: any
  disabled: boolean
  action: () => void
}
export const AutofillServiceScreen: FC<SettingsScreenProps<"autofillService">> = observer(
  ({ navigation }) => {
    const { translate } = useAppLocale()

    const [enabled, setEnabled] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [items, setItems] = useState<ItemType[]>([])
    const [api, setApi] = useState(0)
    const [manufacturer, setManufacturer] = useState("")
    const appState = useRef(AppState.currentState)
    const [appStateVisible, setAppStateVisible] = useState(appState.current)

    const requestAutofill = () => {
      RNAutofillServiceAndroid.openAutofillSettings()
    }

    useEffect(() => {
      const sub = AppState.addEventListener("change", (state) => {
        setAppStateVisible(state)
      })
      return () => sub.remove()
    }, [])

    useEffect(() => {
      const init = async () => {
        const apiLevel = await getApiLevel()
        const manu = (await getManufacturer()).toLowerCase()
        setApi(apiLevel)
        setManufacturer(manu)
      }
      init()
    }, [])

    useEffect(() => {
      AutofillServiceEnabled(setEnabled)
    }, [appStateVisible])

    useEffect(() => {
      const list = []

      if (manufacturer === "xiaomi") {
        list.push({
          key: "xiaomi_perm",
          title: translate("autofill_service:android.other_permission.name_xiaomi"),
          header: translate("autofill_service:android.other_permission.header"),
          desc: translate("autofill_service:android.other_permission.desc"),
          image: PER,
          disabled: api < 26,
          action: () => RNManufacturerSettings.XIAOMI_APP_PERM_EDITOR(),
        })
      }

      list.push({
        key: "autofill_setting",
        title: translate("autofill_service:android.android_autofill.name"),
        header: translate("autofill_service:android.android_autofill.header"),
        desc: translate("autofill_service:android.android_autofill.desc"),
        image: HINT,
        disabled: api < 26,
        action: requestAutofill,
      })

      setItems(list)
    }, [manufacturer, api])

    return (
      <Screen
        safeAreaEdges={["bottom"]}
        preset="auto"
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={() => navigation.goBack()}
            titleTx={"settings:autofill_service"}
          />
        }
        footer={
          <Button
            tx={enabled ? "common:ok" : "common:open_settings"}
            onPress={() => {
              if (enabled) {
                navigation.navigate("mainTab", { screen: "homeTab" })
              } else {
                requestAutofill()
              }
            }}
            style={styles.ph16}
          />
        }
        contentContainerStyle={styles.container}
      >
        <AutofillServiceRender
          enabled={enabled}
          content={{
            title: translate("autofill_service:android.android_autofill.name"),
            header: translate("autofill_service:android.android_autofill.header"),
            desc: translate("autofill_service:android.android_autofill.desc"),
            image: HINT,
            disabled: api < 26,
            action: requestAutofill,
          }}
        />
      </Screen>
    )
  }
)

const AutofillServiceRender = ({
  enabled,
  content,
}: {
  enabled: boolean
  content: {
    title: string
    header: string
    desc: string
    image: any
    action?: () => void
    disabled?: boolean
    border?: boolean
  }
}) => {
  return (
    <View style={styles.renderContainer}>
      {enabled && (
        <View style={styles.centerView}>
          <Image resizeMode="cover" source={ACTIVE} style={styles.activeImage} />
          <Text
            preset="bold"
            size="xl"
            tx="autofill_service:activated.title"
            style={styles.centerText}
          />
          <Text tx="autofill_service:activated.content" style={styles.activeContent} />
        </View>
      )}
      {!enabled && (
        <View style={styles.centerView}>
          <Image resizeMode="contain" source={content.image} style={styles.unactiveImage} />
          <Text text={content.desc} style={styles.centerText} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  activeContent: {
    marginTop: 24,
    textAlign: "center",
  },
  activeImage: {
    borderRadius: 16,
    height: 215,
    marginBottom: 16,
    width: 250,
  },
  centerText: {
    textAlign: "center",
  },
  centerView: {
    alignItems: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  ph16: {
    paddingHorizontal: 16,
  },
  renderContainer: {
    flex: 1,
    justifyContent: "center",
  },

  unactiveImage: {
    height: 227,
    marginVertical: 16,
    width: 335,
  },
})
