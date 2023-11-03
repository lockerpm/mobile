import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { AppStackScreenProps, TOOLS_ITEMS } from "app/navigators"
import { Button, Header, ImageIcon, Screen, TextInput } from "app/components/cores"
import { useCipherData, useCipherHelper, useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { getTOTP, parseOTPUri } from "app/utils/totp"
import { CipherType } from "core/enums"

export const AuthenticatorEditScreen: FC<AppStackScreenProps<"authenticator__edit">> = observer(
  (props) => {
    const navigation = props.navigation
    const route = props.route

    const { notify, translate } = useHelper()

    const { createCipher, updateCipher } = useCipherData()
    const { newCipher } = useCipherHelper()
    const { cipherStore } = useStores()

    const { mode = "add", passwordTotp, passwordMode } = route.params
    const selectedCipher: CipherView = cipherStore.cipherView
    const defaultSecretKey = (() => {
      const otp = parseOTPUri(selectedCipher.notes)
      return otp ? otp.secret : ""
    })()

    // ----------------- PARAMS ------------------

    const [isLoading, setIsLoading] = useState(false)

    // Forms
    const [name, setName] = useState(mode !== "add" ? selectedCipher.name : "")
    const [secretKey, setSecretKey] = useState(mode !== "add" ? defaultSecretKey : "")

    // ----------------- METHODS ------------------

    const handleSave = async () => {
      try {
        const otp = getTOTP({ secret: secretKey })
        if (!otp) {
          notify("error", translate("authenticator.invalid_key"))
          return
        }
      } catch (e) {
        notify("error", translate("authenticator.invalid_key"))
        return
      }

      setIsLoading(true)
      let payload: CipherView
      if (mode === "add") {
        payload = newCipher(CipherType.TOTP)
      } else {
        // @ts-ignore
        payload = { ...selectedCipher }
      }

      payload.name = name
      payload.notes = `otpauth://totp/${encodeURIComponent(
        name,
      )}?secret=${secretKey}&issuer=${encodeURIComponent(name)}&algorithm=SHA1&digits=6&period=30`

      let res = { kind: "unknown" }
      if (["add", "clone"].includes(mode)) {
        res = await createCipher(payload, 0, [])
      } else {
        res = await updateCipher(payload.id, payload, 0, [])
      }

      setIsLoading(false)
      if (res.kind === "ok") {
        if (!passwordTotp) {
          navigation.goBack()
        } else {
          cipherStore.setSelectedTotp(payload.notes)

          navigation.navigate("passwords__edit", {
            mode: passwordMode,
          })
        }
      }
    }

    // ----------------- RENDER ------------------

    return (
      <Screen
        preset="auto"
        safeAreaEdges={["bottom"]}
        header={
          <Header
            title={mode === "add" ? translate("authenticator.enter_key") : translate("common.edit")}
            onLeftPress={() => {
              navigation.goBack()
            }}
            leftText={translate("common.cancel")}
            RightActionComponent={
              <Button
                disabled={isLoading || !name.trim() || !secretKey.trim()}
                preset="teriatary"
                text={translate("common.save")}
                onPress={handleSave}
              />
            }
          />
        }
        contentContainerStyle={{
          flex: 1,
        }}
      >
        {/* Name */}
        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: "row" }}>
            <ImageIcon
              icon={TOOLS_ITEMS.authenticator.icon}
              size={50}
              style={{ marginRight: 10, marginTop: 25 }}
            />

            <View style={{ flex: 1 }}>
              <TextInput
                animated
                isRequired
                label={translate("common.item_name")}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
        </View>
        {/* Name end */}

        {/* Info */}
        {mode === "add" && (
          <View
            style={{
              paddingHorizontal: 16,
              paddingBottom: 32,
            }}
          >
            <TextInput
              isPassword
              animated
              isRequired
              label={translate("authenticator.secret_key")}
              value={secretKey}
              onChangeText={(val) => {
                setSecretKey(val.replace(/\s/g, ""))
              }}
            />
          </View>
        )}
      </Screen>
    )
  },
)
