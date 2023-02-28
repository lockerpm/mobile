import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React from "react"
import { View, Image } from "react-native"
import { APP_ICON } from "../../../common/mappings"
import { Button } from "../../../components"
import { Screen, Text } from "../../../components/cores"
import { LanguagePicker } from "../../../components/utils"
import { useStores } from "../../../models"
import { useMixins } from "../../../services/mixins"
import { verticalScale } from "../../../services/mixins/adaptive-layout"

export const LoginSelectScreen = observer(() => {
  const navigation = useNavigation()
  const { uiStore } = useStores()
  const {translate} = useMixins()
  return (
    <Screen
      safeAreaEdges={["top"]}
      contentContainerStyle={{
        flex: 1,
        padding: 20,
        paddingTop: 70,
      }}
    >
      <LanguagePicker />
      <View
        style={{
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Image
          source={uiStore.isDark ? APP_ICON.textVerticalLight : APP_ICON.textVertical}
          style={{ height: verticalScale(80), width: verticalScale(90) }}
        />
      </View>
      <Text
        preset="bold"
        text={translate("login_select.title")}
        size="large"
        style={{ marginBottom: 16 }}
      />
      <Button
        onPress={() => {
          navigation.navigate("login", { type: "individual" })
        }}
        text={translate("login_select.individual")}
        style={{ marginBottom: 16 }}
      />

      <Button
        onPress={() => {
          navigation.navigate("login", { type: "individual" })
        }}
        text={translate("login_select.business")}
        style={{ marginBottom: 16 }}
      />

      <Button
        onPress={() => {
          navigation.navigate("login", { type: "onPremise" })
        }}
        text={translate("login_select.onpremise")}
        style={{ marginBottom: 16 }}
      />
    </Screen>
  )
})
