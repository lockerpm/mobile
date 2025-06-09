import React from "react"
import { View, StyleSheet } from "react-native"
import { BottomModalContainer, Text } from "app/components/cores"
import { ActionItem } from "app/components/ciphers"
import { useAppLocale, useTheme } from "app/services/context"
import { debounce } from "app/utils/utils"
import { useClipboard } from "app/services/utils"
import { CipherView } from "core/models/view"
import { CipherActionsModal } from "app/static/types"

interface Props {
  item: CipherView
  setNextModal: (action: CipherActionsModal) => void
  onClose: () => void
}

export const Actions = ({ item, setNextModal, onClose }: Props) => {
  const { colors } = useTheme()
  const { copyToClipboard } = useClipboard()
  const { translate } = useAppLocale()

  return (
    <BottomModalContainer>
      <View style={styles.headerContainer}>
        <View style={styles.row}>
          {/* <View>
            <Text preset="bold" text={item.full_address} style={{ marginBottom: 4 }} />
            <Text text={moment.unix(item.created_time).format("DD/MM/YYYY")} />
          </View> */}
        </View>
      </View>

      <ActionItem
        bottomDivider
        name={translate("private_relay.copy")}
        icon="copy"
        action={() => {
          copyToClipboard("")
        }}
      />
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    width: "100%",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
