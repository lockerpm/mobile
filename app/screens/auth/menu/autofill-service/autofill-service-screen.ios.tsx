import React, { useState, useRef, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { Header, Layout, Text, Button } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { View, Image, Linking, AppState } from "react-native"
import { AutofillServiceEnabled } from "app/utils/autofillHelper"
import { Step } from "./enable-autofill-step"


export const AutofillServiceScreen = observer(function AutofillServiceScreen() {
  const navigation = useNavigation()
  const { translate } = useMixins()

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [enabled, setEnabled] = useState(false)

  // ---------------------------EFFECT-----------------------
  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      setAppStateVisible(nextAppState);
    });

    return () => {
      subscription == null;
    };
  }, []);

  useEffect(() => {
    AutofillServiceEnabled(isActived => {
      setEnabled(isActived)
    })
  }, [appStateVisible])

  return (
    <Layout
      header={!enabled ? (
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('settings.autofill_service')}
          right={(<View style={{ width: 30 }} />)}
        />
      ) : null}

      footer={(
        <View>
          <Button
            text={enabled ? translate("common.ok") : translate("common.open_settings")}
            onPress={() => {
              if (enabled) {
                navigation.navigate("mainTab", { screen: "homeTab" })
              } else {
                Linking.canOpenURL('app-settings:').then(supported => {
                  if (supported) {
                    Linking.openURL('App-prefs:root=General&path=Passwords')
                  }
                })
              }

            }}
          >
          </Button>
        </View>
      )}
    >
      {
        enabled && (
          <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
            <Image source={require("./autofillActive.png")} style={{ width: 335, height: 215 }}></Image>
            <View style={{ marginTop: 24, alignItems: "center" }}>
              <Text preset="largeHeader" text={translate("autofill_service.activated.title")} style={{ textAlign: "center" }} />
              <Text preset="black" text={translate("autofill_service.activated.content")} style={{ marginTop: 24, textAlign: "center" }} />
            </View>

          </View>
        )
      }
      {
        !enabled && <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
          <Text preset="header" text="Enable Password Autofill" />

          <Text text="Get your Locker information right where you need it, from the keyboard" style={{
            marginTop: 12,
            marginBottom: 15,
            textAlign: "center"
          }} />
          <Image source={require("./IosHint.png")} style={{ width: 335, height: 215 }}></Image>
          <View>
            <Text preset="black" text="Step-by-step, in Settings → Passwords:" style={{
              marginTop: 25,
              marginBottom: 10,
            }} />

            <Step img={require("./assets/keyboard.png")} text="Tap on Autofill Passwords" />
            <Step img={require("./assets/switch.png")} text="Enable Autofill Passwords" />
            <Step img={require("./assets/key.png")} text="Important! Tap to disable Keychain" />
            <Step img={require("./assets/locker.png")} text="Tap to enable Locker" />
          </View>
        </View>
      }

    </Layout>
  )
})
