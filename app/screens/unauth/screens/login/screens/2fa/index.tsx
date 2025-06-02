import React, { FC, useCallback, useState } from "react"
import { View, StyleSheet, KeyboardAvoidingView } from "react-native"
import { MethodSelection } from "./MethodSelection"
import { OtpAuthen } from "./OtpAuthen"
import { LoginScreenProps } from "app/navigators"
import { IS_IOS } from "app/config/constants"
import { debounce } from "app/utils/utils"
import { ModalBackdrop } from "app/components/cores"
import { User2FAMethod } from "app/static/types"

export const TwoFAAuthenScreen: FC<LoginScreenProps<"twoFA">> = ({
  navigation,
  route: { params },
}) => {
  const { credential, type } = params
  // --------------------- PARAMS -----------------------
  const [method, setMethod] = useState<User2FAMethod | null>(
    type === "password" ? null : credential.methods[0],
  )

  // --------------------- METHODS ----------------------
  const onClose = debounce(navigation.goBack, 400)

  const clearMethod = useCallback(() => {
    setMethod(null)
  }, [])

  return (
    <KeyboardAvoidingView
      behavior={IS_IOS ? "padding" : undefined}
      keyboardVerticalOffset={0}
      style={styles.flex}
    >
      <View style={styles.flex}>
        <ModalBackdrop onPress={onClose} />
        {!method && type === "password" && (
          <MethodSelection credential={credential} onSelect={setMethod} />
        )}
        {!!method && <OtpAuthen params={params} goBack={clearMethod} method={method} />}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
})
