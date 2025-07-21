import { ModalBackdrop } from "app/components/cores"
import { BrowseScreenProps } from "app/navigators"
import { CipherEditHelperModal } from "app/static/types"
import { debounce } from "app/utils/utils"
import { FC, useState } from "react"
import { KeyboardAvoidingView, View, StyleSheet, Platform } from "react-native"
import { Premium } from "./Premium"
import { HideEmail } from "./hideEmail"
import { observer } from "mobx-react-lite"
import { PasswordGenerate } from "./PasswordGenerate"
import { OtpSelect } from "./OtpSelect"

const IS_IOS = Platform.OS === "ios"

export const CipherEditHelperModalScreen: FC<BrowseScreenProps<"cipherEditHelperModal">> = observer(
  ({
    navigation,
    route: {
      params: { mode },
    },
  }) => {
    const [targetModal, setTargetModal] = useState(mode)

    const onClose = debounce(navigation.goBack, 400)

    return (
      <KeyboardAvoidingView
        behavior={IS_IOS ? "padding" : "height"}
        keyboardVerticalOffset={0}
        style={styles.flex}
      >
        <View style={styles.flex}>
          <ModalBackdrop onPress={onClose} />
          {targetModal === CipherEditHelperModal.HIDE_EMAIL && (
            <HideEmail setNexModal={setTargetModal} onClose={onClose} />
          )}

          {targetModal === CipherEditHelperModal.GENERATE_PASSWORD && (
            <PasswordGenerate onClose={onClose} />
          )}

          {targetModal === CipherEditHelperModal.PLAN_STORAGE_LIMIT && <Premium />}

          {targetModal === CipherEditHelperModal.PASSWORD_OTP && <OtpSelect onClose={onClose} />}

          {targetModal === CipherEditHelperModal.PREMIUM_ACTION && <Premium />}
        </View>
      </KeyboardAvoidingView>
    )
  }
)

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
})
