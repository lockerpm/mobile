import { StyleSheet, View } from "react-native"
import { Text, TextInput } from "app/components/cores"
import { useCipherHelper } from "app/services/hook"
import { CipherType } from "core/enums"
import { PasswordStrength, Textarea } from "app/components/utils"
import { CipherAppView } from "app/static/types"
import { DynamicUris, PasswordOtp } from "@/components/ciphers"

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
          labelTx="password:username"
          value={item.login.username}
          editable={false}
        />
      )}

      <TextInput
        animated
        isPassword
        isCopyable={item.viewPassword}
        labelTx="common:password"
        value={item.login.password}
        editable={false}
      />

      {item.login.hasTotp && (
        <>
          <Text size="sm" preset="label" tx="password:2fa_setup" style={styles.mb4} />

          <View style={styles.mb20}>
            <PasswordOtp data={item.login.totp} secure />
          </View>
        </>
      )}

      {!!item.login.password && <PasswordStrength preset="text" value={passwordStrength.score} />}

      <DynamicUris editable={false} fields={item.login.uris.map((e) => e.uri)} />

      {!lockerMasterPassword && (
        <>
          {!!item.notes && (
            <Textarea
              labelTx="common:notes"
              value={item.notes}
              editable={false}
              style={styles.mt12}
            />
          )}
        </>
      )}

      {lockerMasterPassword && (
        <>
          <Text preset="label" size="sm" tx="common:notes" style={styles.masterPwNote} />
          <Text tx="password:master_password_note" />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  masterPwNote: {
    marginVertical: 12,
  },
  mb20: {
    marginBottom: 20,
  },
  mb4: {
    marginBottom: 4,
  },
  mt12: {
    marginTop: 12,
  },
})
