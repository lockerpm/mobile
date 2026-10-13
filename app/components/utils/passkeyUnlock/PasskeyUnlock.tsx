import { useEffect, useRef, useState } from "react"
import { Alert, Image, InteractionManager, StyleSheet, View, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"

import { Button, Header, Screen, Text } from "app/components/cores"
import { useStores } from "app/models"
import { AppScreenProps } from "app/navigators/navigators.types"
import { useAuthentication, usePasskeyBackup } from "app/services/hook"
import { MPEncodeConfig } from "app/static/types"

import { TxKeyPath, useAppLocale } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

interface Props {
  lockConfig: MPEncodeConfig
  titleTx: TxKeyPath
  descTx: TxKeyPath
  onBack: () => void
  // Called once the vault session is restored with the passkey
  onUnlocked: () => void
}

/**
 * Unlock the vault with a PRF passkey instead of the master password.
 * The passkey prompt starts as soon as the screen is shown.
 */
export const PasskeyUnlock = observer(
  ({ lockConfig, titleTx, descTx, onBack, onUnlocked }: Props) => {
    const navigation = useNavigation<AppScreenProps<"passkeyUnlock">["navigation"]>()
    const { user } = useStores()
    const { translate } = useAppLocale()
    const {
      themed,
      theme: { colors },
    } = useAppTheme()
    const { passkeyLogin } = useAuthentication()
    const { getPasskeyUnlockKey } = usePasskeyBackup()

    // ---------------------- PARAMS -------------------------

    const [isUnlocking, setIsUnlocking] = useState(false)
    const isUnlockingRef = useRef(false)

    const displayName = user.full_name || user.email || ""

    // ---------------------- METHODS -------------------------

    const showAlert = (message: string) => {
      Alert.alert("", message, [{ text: translate("common:ok"), style: "cancel" }])
    }

    const unlock = async () => {
      if (isUnlockingRef.current) {
        return
      }
      isUnlockingRef.current = true
      setIsUnlocking(true)

      const passkeyKey = await getPasskeyUnlockKey()
      const res = passkeyKey ? await passkeyLogin(lockConfig, passkeyKey) : null

      isUnlockingRef.current = false
      setIsUnlocking(false)

      if (!res) {
        return
      }
      if (res.kind === "ok") {
        onUnlocked()
      } else if (res.kind === "unauthorized") {
        navigation.navigate("unAuthStack", {
          screen: "loginStack",
          params: {
            screen: "login",
          },
        })
      } else if (res.kind === "enterprise-lock") {
        showAlert(translate("alert:enterprise_lock"))
      } else if (res.kind === "enterprise-system-lock") {
        showAlert(translate("alert:enterprise_system_lock"))
      } else if (res.kind === "enterprise-belongs") {
        // The master password screen shows the enterprise invitations
        onBack()
      }
    }

    // ---------------------- EFFECT -------------------------

    useEffect(() => {
      // Wait for the screen transition before presenting the system passkey sheet
      const task = InteractionManager.runAfterInteractions(() => {
        unlock()
      })
      return () => task.cancel()
    }, [])

    // ---------------------- RENDER -------------------------

    return (
      <Screen
        preset="auto"
        safeAreaEdges={["bottom"]}
        header={<Header leftIcon="arrow-left" onLeftPress={onBack} titleTx={titleTx} />}
        contentContainerStyle={styles.container}
      >
        <Text tx={descTx} style={styles.textCenter} />

        <View style={styles.center}>
          <View style={themed($user)}>
            {user.avatar ? (
              <Image resizeMode="contain" source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text
                  size="xs"
                  color={colors.white}
                  text={displayName.charAt(0).toUpperCase()}
                  style={styles.textCenter}
                />
              </View>
            )}
            <Text size="sm" text={displayName} style={styles.name} />
          </View>
        </View>

        <Button
          loading={isUnlocking}
          disabled={isUnlocking}
          tx="common:continue"
          onPress={unlock}
          preset="primary"
        />
      </Screen>
    )
  }
)

const $user: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginVertical: 24,
  borderRadius: 20,
  backgroundColor: colors.block,
  flexDirection: "row",
  alignItems: "center",
  padding: 4,
})

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  center: {
    alignItems: "center",
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  name: {
    marginHorizontal: 10,
  },
  textCenter: {
    textAlign: "center",
  },
})
