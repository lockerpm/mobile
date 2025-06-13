import React from "react"
import { Linking, View } from "react-native"
import { Text, Icon, TextInput } from "app/components/cores"
import { useCipherHelper } from "app/services/hook"
import { CipherType } from "core/enums"
import { PasswordStrength, Textarea } from "app/components/utils"
import { CipherAppView } from "app/static/types"
import { PasswordOtp } from "../cipherEdit/passwords/Otp"

type Props = {
  item: CipherAppView
}

export const PasswordInfo = ({ item }: Props) => {
  const { getPasswordStrength } = useCipherHelper()

  // ------------------ COMPUTED --------------------
  const lockerMasterPassword = item.type === CipherType.MasterPassword
  const passwordStrength = getPasswordStrength(item.login.password)

  // ------------------ RENDER --------------------

  return (
    <View>
      {!lockerMasterPassword && (
        <TextInput
          animated
          isCopyable
          labelTx="password.username"
          value={item.login.username}
          editable={false}
        />
      )}

      <TextInput
        animated
        isPassword
        isCopyable={item.viewPassword}
        labelTx="common.password"
        value={item.login.password}
        editable={false}
      />

      {item.login.hasTotp && (
        <>
          <Text size="base" preset="label" tx="password.2fa_setup" style={{ marginBottom: 4 }} />

          <View
            style={{
              marginBottom: 20,
            }}
          >
            <PasswordOtp data={item.login.totp} secure />
          </View>
        </>
      )}

      <PasswordStrength preset="text" value={passwordStrength.score} />

      <TextInput
        animated
        labelTx="password.website_url"
        value={item.login.uri}
        editable={false}
        RightAccessory={() => (
          <Icon
            icon="external-link"
            size={20}
            onPress={
              !item.login.uri
                ? undefined
                : () => {
                    Linking.openURL(item.login.uri).catch(() => {
                      Linking.openURL("https://" + item.login.uri)
                    })
                  }
            }
            containerStyle={{
              alignSelf: "center",
              paddingRight: 12,
            }}
          />
        )}
      />

      {!lockerMasterPassword && (
        <>
          {!!item.notes && (
            <Textarea
              labelTx="common.notes"
              value={item.notes}
              editable={false}
              style={{ marginTop: 12 }}
            />
          )}
        </>
      )}

      {lockerMasterPassword && (
        <>
          <Text preset="label" size="base" tx="common.notes" style={{ marginBottom: 12 }} />
          <Text tx="password.master_password_note" />
        </>
      )}
    </View>
  )
}
