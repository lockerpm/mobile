import React, { useState } from "react"
import { View, Image } from "react-native"
import { useNavigation, CommonActions } from "@react-navigation/native"
import { useStores } from "app/models"
import { useTheme } from "app/services/context"
import { useAuthentication, useHelper } from "app/services/hook"
import { Screen, Text, TabHeader } from "app/components/cores"
import { MenuItem, MenuItemContainer, MenuItemProps } from "app/components/utils"
import { getVersion } from "react-native-device-info"
import { observer } from "mobx-react-lite"

export const MenuScreen = observer(() => {
  const navigation = useNavigation() as any
  const { user } = useStores()
  const { colors } = useTheme()
  const { translate } = useHelper()
  const { lock, logout } = useAuthentication()

  const appVersion = `${getVersion()}`

  const [showFingerprint, setShowFingerprint] = useState(false)

  // ------------------COMPUTED------------------------

  const items: MenuItemProps[] = [
    {
      icon: "gear",
      name: translate("common.settings"),
      onPress: () => navigation.navigate("settings"),
    },
  ]

  const items2: MenuItemProps[] = [
    {
      icon: "lock-key",
      name: translate("common.lock"),
      onPress: async () => {
        await lock()
        navigation.navigate("lock")
      },
    },
    {
      icon: "sign-out",
      name: translate("common.logout"),
      onPress: async () => {
        await logout()

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "init" }],
          }),
        )
      },
    },
  ]
  // -------------- RENDER --------------------

  return (
    <Screen
      preset="auto"
      padding
      backgroundColor={colors.block}
      footer={
        <>
          <View
            style={{
              marginTop: 24,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text preset="label" size="medium">
              {translate("menu.product_of")}
            </Text>
          </View>
          <Text preset="label" weight="semibold" style={{ marginVertical: 8, textAlign: "center" }}>
            {"VinCSS & CyStack"} - {appVersion}
          </Text>
        </>
      }
      header={<TabHeader title={translate("common.menu")} />}
    >
      <MenuItemContainer>
        <View style={{ padding: 16, flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}>
            {!!user.avatar && (
              <Image
                source={{ uri: user.avatar }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text text={user.email} />
            {user.pwd_user_type === "enterprise" && user.enterprise && (
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 5,
                  alignItems: "center",
                }}
              >
                <Text text={translate("common.enterprise") + ":"} style={{ marginRight: 8 }} />
                <Text preset="bold" text={user.enterprise.name} color={colors.primary} />
              </View>
            )}
          </View>
        </View>
      </MenuItemContainer>

      <MenuItemContainer>
        <MenuItem
          icon={"fingerprint"}
          name={translate("menu.fingerprint")}
          onPress={() => setShowFingerprint(!showFingerprint)}
          rightIcon={showFingerprint ? "eye-slash" : "eye"}
          content={
            <View style={{ flex: 1 }}>
              <Text text={translate("menu.fingerprint")} />
              {showFingerprint && (
                <Text
                  style={{
                    color: colors.error,
                    marginTop: 5,
                  }}
                  text={user.fingerprint}
                />
              )}
            </View>
          }
        />
      </MenuItemContainer>

      <MenuItemContainer>
        {items
          .filter((item) => !item.hide)
          .map((item, index) => (
            <MenuItem key={index} {...item} />
          ))}
      </MenuItemContainer>

      <MenuItemContainer>
        {items2.map((item, index) => (
          <MenuItem key={index} {...item} />
        ))}
      </MenuItemContainer>
    </Screen>
  )
})
