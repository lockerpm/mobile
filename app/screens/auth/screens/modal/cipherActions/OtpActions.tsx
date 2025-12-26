import { View, StyleSheet } from "react-native"

import { BottomModalContainer, Text } from "app/components/cores"
import { NewActionSheetItem } from "app/components/utils"
import { CipherActionsModal, CipherAppView } from "app/static/types"

import { useClipboard } from "@/services/utils"
import { getTOTP, parseOTPUri } from "@/utils/totp"
import { useAppTheme } from "@/utils/useAppTheme"

import { useActionsNavigate } from "./useActionsNavigate"

interface Props {
  item: CipherAppView
  setNextModal: (action: CipherActionsModal) => void
  onClose: () => void
}

export const OtpActions = ({ item, setNextModal, onClose }: Props) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { copyToClipboard } = useClipboard()

  // ------------------------COMPUTED------------------------

  const otp = parseOTPUri(item.notes)

  // -----------------------METHODS-----------------------

  const { navigateCipherEdit } = useActionsNavigate(item, onClose)

  return (
    <BottomModalContainer>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text preset="bold" text={item.name} numberOfLines={2} />
        </View>
      </View>

      <NewActionSheetItem
        bottomBorder
        tx="authenticator:copy_code"
        icon="copy"
        onPress={() => {
          onClose()
          getTOTP(otp).then((code) => {
            copyToClipboard(code)
          })
        }}
      />
      <NewActionSheetItem bottomBorder tx="common:edit" icon="edit" onPress={navigateCipherEdit} />

      <NewActionSheetItem
        tx="common:delete"
        icon="trash"
        color={colors.error}
        iconColor={colors.error}
        onPress={() => {
          setNextModal(CipherActionsModal.DELETE)
        }}
      />
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    width: "100%",
  },
  headerContent: {
    flexGrow: 1,
    flexShrink: 1,
  },
})
