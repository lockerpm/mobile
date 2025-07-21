import { useState } from "react"
import { observer } from "mobx-react-lite"
import { StyleSheet, View } from "react-native"
import { Header, ImageIcon, Screen, TextInput } from "app/components/cores"
import { useCipherData } from "app/services/hook"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { getTOTP, parseOTPUri } from "app/utils/totp"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import { useToast } from "app/services/utils"
import { BrowseScreenProps } from "@/navigators"
import { CipherAppView, CipherEditMode } from "@/static/types"
import { Logger } from "@/utils/logger"
import { useAppTheme } from "@/utils/useAppTheme"
import { SecureNoteType } from "core/enums"

type Props = {
  item: CipherAppView
  mode: CipherEditMode
  navigation: BrowseScreenProps<"cipherEdit">["navigation"]
}

export const AuthenticatorEdit = observer(({ navigation, item, mode }: Props) => {
  const { notifyTx } = useToast()
  const {
    theme: { colors },
  } = useAppTheme()

  const { createCipher, updateCipher } = useCipherData()
  const { user } = useStores()

  const defaultSecretKey = (() => {
    const otp = parseOTPUri(item.notes)
    return otp.secret
  })()

  // ---------------------- PARAMS -----------------------

  const [isLoading, setIsLoading] = useState(false)

  // Forms
  const [name, setName] = useState(item.name)
  const [secretKey, setSecretKey] = useState(mode !== "add" ? defaultSecretKey : "")

  // ---------------------- METHODS -----------------------
  const handleSave = async () => {
    try {
      const otp = getTOTP({ secret: secretKey })
      if (!otp) {
        notifyTx("error", "authenticator:invalid_key")
        return
      }
    } catch (e) {
      Logger.error("AuthenticatorEditScreen", "handleSave", e)
      notifyTx("error", "authenticator:invalid_key")
      return
    }

    setIsLoading(true)

    // @ts-ignore
    const payload: CipherView = { ...item }

    payload.secureNote.type = SecureNoteType.Generic
    payload.name = name
    payload.notes = `otpauth://totp/${encodeURIComponent(
      name
    )}?secret=${secretKey}&issuer=${encodeURIComponent(name)}&algorithm=SHA1&digits=6&period=30`

    let res = { kind: "unknown" }
    if (["add", "clone"].includes(mode)) {
      res = await createCipher(payload, 0, [])
    } else {
      res = await updateCipher(payload.id, payload, 0, [])
    }

    setIsLoading(false)
    if (res.kind === "ok") {
      logFirebaseEvent(AnalyticEvents.ADD_OTP, user.email)
      navigation.goBack()
    }
  }

  // ----------------- RENDER ------------------

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["bottom"]}
      header={
        <Header
          titleTx={mode === "add" ? "authenticator:enter_key" : "common:edit"}
          onLeftPress={navigation.goBack}
          leftTx={"common:cancel"}
          rightTx="common:save"
          rightIconColor={colors.primary}
          rightLoading={isLoading}
          rightDisabled={isLoading || !name.trim() || !secretKey.trim()}
          onRightPress={handleSave}
        />
      }
      contentContainerStyle={styles.flex}
    >
      <View style={styles.name}>
        <ImageIcon icon={"authenticator"} size={50} style={styles.logo} />

        <View style={styles.flex}>
          <TextInput
            animated
            isRequired
            labelTx="common:item_name"
            value={name}
            onChangeText={setName}
          />
        </View>
      </View>

      {mode === "add" && (
        <View style={styles.info}>
          <TextInput
            isPassword
            animated
            isRequired
            labelTx="authenticator:secret_key"
            value={secretKey}
            onChangeText={(val) => {
              setSecretKey(val.replace(/\s/g, ""))
            }}
          />
        </View>
      )}
    </Screen>
  )
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  info: {
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  logo: {
    marginRight: 10,
    marginTop: 25,
  },
  name: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
})
