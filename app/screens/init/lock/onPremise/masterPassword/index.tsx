import React, { useState } from "react"
import { BackHandler, View, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { OnPremisePreloginData } from "app/static/types"
import { useAuthentication } from "app/services/hook"
import { useAppLocale, useTheme } from "app/services/context"
import { Logo, Button, Screen, Text, TextInput } from "app/components/cores"
import { RootStackScreenProps } from "app/navigators/navigators.types"

interface Props {
  data: OnPremisePreloginData
  email: string
  handleLogout: () => void
  handleUnlock: () => Promise<void>
}

export const OnPremiseLockMasterPassword = ({ data, email, handleLogout, handleUnlock }: Props) => {
  const navigation = useNavigation<RootStackScreenProps<"lock">["navigation"]>()
  const { user, uiStore } = useStores()
  const { colors } = useTheme()
  const { translate } = useAppLocale()
  const { sessionLogin } = useAuthentication()

  // ---------------------- PARAMS -------------------------

  const [masterPassword, setMasterPassword] = useState("")

  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isError, setIsError] = useState(false)

  // ---------------------- METHODS -------------------------

  const isAutofillAnroid = uiStore.isAndroidAutofillService

  // ---------------------- METHODS -------------------------

  const unlock = async () => {
    if (masterPassword) {
      setIsError(false)
      setIsUnlocking(true)
      const res = await sessionLogin(masterPassword, () => null, true)

      if (res.kind === "ok") {
        await handleUnlock()
      } else if (res.kind === "unauthorized") {
        navigation.navigate("unAuthStack", {
          screen: "loginStack",
        })
      } else if (res.kind === "on-premise-2fa") {
        //
      } else {
        setIsError(true)
      }
      setIsUnlocking(false)
    } else {
      setIsError(true)
    }
  }

  // ---------------------- RENDER -------------------------
  return (
    <Screen>
      <View style={{ flex: 1 }}>
        <View style={{ alignItems: "flex-end", marginTop: 8 }}>
          {isAutofillAnroid ? (
            <Text
              preset="bold"
              text={translate("common.cancel").toUpperCase()}
              onPress={() => BackHandler.exitApp()}
              color={colors.primary}
            />
          ) : (
            <Text
              preset="bold"
              text={translate("common.signout").toUpperCase()}
              onPress={handleLogout}
              color={colors.primary}
            />
          )}
        </View>
        <View style={{ alignItems: "center", paddingTop: "10%" }}>
          <Logo
            preset={"cystack-logo"}
            style={{ height: 70, width: 70, marginBottom: 10, alignSelf: "center" }}
          />

          <Text preset="bold" size="xl" style={{ marginBottom: 10 }} tx={"lock.title"} />

          <Text style={{ textAlign: "center" }} tx={"lock.desc"} />

          {/* Current user */}
          <View
            style={{
              marginTop: 16,
              marginBottom: 16,
              borderRadius: 20,
              backgroundColor: colors.block,
              flexDirection: "row",
              alignItems: "center",
              padding: 4,
            }}
          >
            {!!data?.avatar && (
              <View style={{ borderRadius: 14, overflow: "hidden" }}>
                <Image
                  resizeMode="contain"
                  source={{ uri: data.avatar }}
                  style={{
                    height: 28,
                    width: 28,
                    backgroundColor: colors.background,
                  }}
                />
              </View>
            )}
            <Text
              size="base"
              style={{
                marginHorizontal: 10,
              }}
            >
              {user.email || email}
            </Text>
          </View>
          {/* Current user end */}

          {/* Master pass input */}
          <TextInput
            isPassword
            animated
            isError={isError}
            label={translate("common.master_pass")}
            onChangeText={setMasterPassword}
            value={masterPassword}
            onSubmitEditing={unlock}
          />
          {/* Master pass input end */}

          <Button
            loading={isUnlocking}
            disabled={isUnlocking || !masterPassword}
            text={translate("common.unlock")}
            onPress={unlock}
            style={{
              marginTop: 20,
            }}
          />
        </View>
      </View>
    </Screen>
  )
}
