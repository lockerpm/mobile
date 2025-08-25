import { StyleSheet, View } from "react-native"
import { Text, TextInput } from "app/components/cores"
import { useCipherHelper } from "app/services/hook"
import { CipherType } from "core/enums"
import { PasswordStrength, Textarea } from "app/components/utils"
import { CipherAppView } from "app/static/types"
import { DynamicUris, PasswordOtp } from "@/components/ciphers"
import { useAppLocale } from "@/i18n"

type Props = {
  item: CipherAppView
}

export const PasswordInfo = ({ item }: Props) => {
  const { getPasswordStrength } = useCipherHelper()
  const { translate } = useAppLocale()

  // ------------------ COMPUTED --------------------
  const lockerMasterPassword = item.type === CipherType.MasterPassword
  const passwordStrength = getPasswordStrength(item.login.password)

  // ------------------ RENDER --------------------

  return (
    <View>
      {!lockerMasterPassword && !!item.login.username && (
        <TextInput
          animated
          isCopyable
          labelTx="password:username"
          value={item.login.username}
          editable={false}
        />
      )}

      {!!item.login.password && (
        <TextInput
          animated
          isPassword
          isCopyable={item.viewPassword}
          labelTx="common:password"
          value={item.login.password}
          editable={false}
        />
      )}

      {item.login.hasTotp && (
        <>
          <Text size="sm" preset="label" tx="password:2fa_setup" style={styles.mb4} />

          <View style={styles.mb20}>
            <PasswordOtp data={item.login.totp} secure />
          </View>
        </>
      )}

      {!!item.login.password && <PasswordStrength preset="text" value={passwordStrength.score} />}

      {item.login.uris && (
        <DynamicUris editable={false} fields={item.login.uris?.map((e) => e.uri)} />
      )}

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
          <Textarea
            disableCopy
            labelTx="common:notes"
            value={translate("password:master_password_note")}
            editable={false}
            style={styles.mt12}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
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
