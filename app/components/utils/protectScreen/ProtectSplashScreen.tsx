import { Modal, View, StyleSheet } from "react-native"

import { Logo } from "@/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"

type Props = {
  isOpen: boolean
  onClose: () => void
}
export const ProtectSplashScreen = ({ isOpen, onClose }: Props) => {
  const {
    theme: { colors },
  } = useAppTheme()
  return (
    <Modal
      transparent
      animationType="fade"
      supportedOrientations={["portrait", "landscape"]}
      style={styles.container}
      visible={isOpen}
      onDismiss={onClose}
    >
      <View
        style={[
          {
            backgroundColor: colors.background,
          },
          styles.content,
        ]}
      >
        <Logo preset="default" style={styles.logo} />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    alignSelf: "center",
    height: 120,
    marginBottom: 25,
    width: 120,
  },
})
