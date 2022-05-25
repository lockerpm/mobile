import React from "react"
import { observer } from "mobx-react-lite"
import { Header, Layout, Text, Button } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { View, Image, Linking } from "react-native"
import { Step } from "./enable_autofill_step"

export const AutofillServiceScreen = observer(function AutofillServiceScreen() {
  const navigation = useNavigation()
  const { translate } = useMixins()
  return (
    <Layout
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
        />
      )}

      footer={(
        <View>
          <Button
            text={translate("common.open_settings")}
            onPress={() => {
              Linking.canOpenURL('app-settings:').then(supported => {
                if (supported) {
                  Linking.openURL('App-prefs:root=General&path=Passwords')
                }
              })
            }}
          >
          </Button>
        </View>
      )}
    >
      <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
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


    </Layout>
  )
})
