import { StyleSheet, View, ViewStyle } from "react-native"
import { Text, BottomModal, ImageIcon } from "app/components/cores"
import { TxKeyPath } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

export const DetailInstructionModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const { themed } = useAppTheme()
  return (
    <BottomModal isOpen={isOpen} onClose={onClose} tx={"common:instruction"}>
      <View style={themed($container)}>
        <Instruction step="01." icon="app-logo" tx={"onpremise_passwordless:instruction.1"} />
        <Instruction step="02." icon="avatar" tx={"onpremise_passwordless:instruction.2"} />
        <Instruction step="03." icon="key-hole" tx={"onpremise_passwordless:instruction.3"} />
        <Instruction
          step="04."
          icon="number-square-one"
          tx={"onpremise_passwordless:instruction.4"}
        />
      </View>
    </BottomModal>
  )
}

const Instruction = ({
  step,
  icon,
  tx,
}: {
  step: string
  icon: "avatar" | "app-logo" | "key-hole" | "number-square-one"
  tx: TxKeyPath
}) => {
  return (
    <View style={styles.insContainer}>
      <Text text={step} />
      <ImageIcon icon={icon} size={32} style={styles.insIcon} />
      <Text tx={tx} style={styles.insText} />
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: "100%",
  padding: 16,
  backgroundColor: colors.block,
  borderRadius: 12,
  marginTop: 16,
})
const styles = StyleSheet.create({
  insContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  insIcon: {
    marginHorizontal: 12,
  },
  insText: {
    maxWidth: "75%",
  },
})
