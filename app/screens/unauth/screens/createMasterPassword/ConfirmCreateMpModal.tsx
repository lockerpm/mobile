import { Image, StyleSheet, TouchableOpacity, View } from "react-native"
import { Text, Button, BottomModal } from "app/components/cores"

type Props = {
  isCreating: boolean
  isOpen: boolean
  onClose: () => void
  onNext: () => void
}

const WARNING = require("assets/images/master-pw-important.png")

export const ConfirmCreateMPModal = (props: Props) => {
  const { isOpen, onClose, onNext, isCreating } = props

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} tx="confirm_create_master_pass:title">
      <View style={styles.container}>
        <Image resizeMode="contain" source={WARNING} style={styles.image} />
        <Text tx={"confirm_create_master_pass:desc"} size="sm" style={styles.textCenter} />
      </View>

      <Button
        disabled={isCreating}
        loading={isCreating}
        tx={"confirm_create_master_pass:next_btn"}
        onPress={onNext}
        style={styles.button}
      />
      <TouchableOpacity disabled={isCreating} onPress={onClose}>
        <Text size="sm" tx={"confirm_create_master_pass:back_btn"} style={styles.textCenter} />
      </TouchableOpacity>
    </BottomModal>
  )
}

const styles = StyleSheet.create({
  button: {
    marginVertical: 16,
  },
  container: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  image: {
    height: 120,
    width: 120,
  },
  textCenter: {
    textAlign: "center",
  },
})
