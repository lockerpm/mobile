import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React from "react"
import { View, Image, TouchableOpacity } from "react-native"
import { APP_ICON } from "../../../common/mappings"
import { Button, Text, Layout } from "../../../components"
import { Icon } from "../../../components/cores"
import { LanguagePicker } from "../../../components/utils"
import { useStores } from "../../../models"
import { useMixins } from "../../../services/mixins"
import { verticalScale } from "../../../services/mixins/adaptive-layout"
import {  spacing } from "../../../theme"

export const LoginSelectScreen = observer(() => {
  const navigation = useNavigation()
  const { uiStore } = useStores()
  const { translate } = useMixins()
  return (
    <Layout
      footer={
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 12,
            justifyContent: "center",
          }}
        >
          <Text
            text={translate("login.no_account")}
            style={{
              marginRight: spacing.smaller,
            }}
          />
          <Button
            preset="link"
            text={translate("common.sign_up")}
            onPress={() => navigation.navigate("signup")}
          />
        </View>
      }
    >
      <LanguagePicker />
      <View
        style={{
          alignItems: "center",
          marginBottom: 32,
          paddingTop: 70,
        }}
      >
        <Image
          source={uiStore.isDark ? APP_ICON.textVerticalLight : APP_ICON.textVertical}
          style={{ height: verticalScale(80), width: verticalScale(90) }}
        />
      </View>

      <Text
        preset="black"
        text={translate("login_select.title")}
        style={{ marginBottom: 16, fontWeight: "600", textAlign: "center", fontSize: 24 }}
      />

      <LoginItem
        icon={"user"}
        title={translate("login_select.individual")}
        action={() => {
          navigation.navigate("login", { type: "individual" })
        }}
      />

      <LoginItem
        icon={"briefcaseMetal"}
        title={translate("login_select.business")}
        action={() => {
          navigation.navigate("login", { type: "individual" })
        }}
      />

      <LoginItem
        icon={"buildings"}
        title={translate("login_select.onpremise")}
        action={() => {
          navigation.navigate("login", { type: "onPremise" })
        }}
      />
    </Layout>
  )
})

const LoginItem = ({
  icon,
  title,
  action,
}: {
  icon: "user" | "buildings" | "briefcaseMetal"
  title: string
  action: () => void
}) => {
  const { color } = useMixins()
  return (
    <TouchableOpacity
      style={{
        padding: 16,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: color.line,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
      }}
      onPress={action}
    >
      <Icon icon={icon} size={24} style={{ marginRight: 16 }} />
      <Text preset="black" text={title} />
    </TouchableOpacity>
  )
}
