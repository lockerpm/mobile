import { useState } from "react"
import { BackHandler, View, Image, StyleSheet, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { OnPremisePreloginData } from "app/static/types"
import { useAuthentication } from "app/services/hook"
import { Logo, Button, Screen, Text, TextInput } from "app/components/cores"
import { AppScreenProps } from "app/navigators/navigators.types"
import { useAppTheme } from "@/utils/useAppTheme"
import { useAppLocale } from "@/i18n"
import { ThemedStyle } from "@/theme"

interface Props {
  data: OnPremisePreloginData
  email: string
  handleLogout: () => void
  handleUnlock: () => Promise<void>
}

export const OnPremiseLockMasterPassword = ({ data, email, handleLogout, handleUnlock }: Props) => {
  const navigation = useNavigation<AppScreenProps<"lock">["navigation"]>()
  const { user, uiStore } = useStores()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
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
      const res = await sessionLogin(
        masterPassword,
        async () => {
          //
        },
        true
      )

      if (res.kind === "ok") {
        await handleUnlock()
      } else if (res.kind === "unauthorized") {
        navigation.navigate("unAuthStack", {
          screen: "loginStack",
          params: {
            screen: "login",
          },
        })
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
    <Screen contentContainerStyle={styles.flex}>
      <View style={styles.header}>
        {isAutofillAnroid ? (
          <Text
            preset="bold"
            text={translate("common:cancel").toUpperCase()}
            onPress={() => BackHandler.exitApp()}
            color={colors.primary}
          />
        ) : (
          <Text
            preset="bold"
            text={translate("common:signout").toUpperCase()}
            onPress={handleLogout}
            color={colors.primary}
          />
        )}
      </View>
      <View style={styles.content}>
        <Logo preset={"cystack-logo"} style={styles.logo} />

        <Text preset="bold" size="xl" style={styles.title} tx={"lock:title"} />

        <Text style={styles.centerText} tx={"lock:desc"} />

        {/* Current user */}
        <View style={themed($avatar)}>
          {!!data?.avatar && (
            <Image resizeMode="contain" source={{ uri: data.avatar }} style={styles.avatar} />
          )}
          <Text size="sm" style={styles.email} text={user.email || email} />
        </View>
        {/* Current user end */}

        {/* Master pass input */}
        <TextInput
          isPassword
          animated
          isError={isError}
          labelTx={"common:master_pass"}
          onChangeText={setMasterPassword}
          value={masterPassword}
          onSubmitEditing={unlock}
        />
        {/* Master pass input end */}

        <Button
          loading={isUnlocking}
          disabled={isUnlocking || !masterPassword}
          tx={"common:unlock"}
          onPress={unlock}
          style={styles.button}
        />
      </View>
    </Screen>
  )
}

const $avatar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginTop: 16,
  marginBottom: 16,
  borderRadius: 20,
  backgroundColor: colors.block,
  flexDirection: "row",
  alignItems: "center",
  padding: 4,
})

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  button: {
    marginTop: 20,
  },
  centerText: {
    textAlign: "center",
  },
  content: { alignItems: "center", paddingTop: "10%" },
  email: {
    marginHorizontal: 10,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  logo: { alignSelf: "center", height: 70, marginBottom: 10, width: 70 },
  title: {
    marginBottom: 10,
  },
})
