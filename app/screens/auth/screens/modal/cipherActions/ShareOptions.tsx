import React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { Text, BottomModalContainer } from "app/components/cores"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { CipherActionsModal } from "app/static/types"
import { PremiumTag } from "app/components/utils"

interface Props {
  onClose: () => void
  setNextModal: (action: CipherActionsModal) => void
  cipherId: string
}

export const ShareOptions = ({ onClose, setNextModal }: Props) => {
  // const navigation = useNavigation<AuthStackScreenProps<"cipherActionsModal">["navigation"]>()
  const { colors } = useTheme()
  const { user } = useStores()
  // --------------------PARAMS---------------------
  const premiumLock = user.isFreePlan

  // --------------------METHODS---------------------

  const quickShare = () => {
    // navigation.navigate("quick_shares", { cipher: selectedCipher })
    onClose()
  }

  const normalShare = () => {
    if (premiumLock) {
      setNextModal(CipherActionsModal.PREMIUM_ACTION)
    } else {
      // navigation.navigate("normal_shares", { ciphers: [selectedCipher] })
      onClose()
    }
  }

  return (
    <BottomModalContainer style={styles.container}>
      <Text preset="bold" tx="quick_shares.share_option.title" style={styles.header} />
      <TouchableOpacity
        onPress={normalShare}
        style={[
          styles.normalShareContainer,
          {
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.normalShare}>
          <Text preset="bold" tx={"quick_shares.share_option.normal.tl"} style={styles.mr8} />
          {premiumLock && <PremiumTag />}
        </View>

        <Text preset="label" tx="quick_shares.share_option.normal.dec" />
      </TouchableOpacity>
      <TouchableOpacity onPress={quickShare}>
        <Text preset="bold" tx="quick_shares.share_option.quick.tl" style={styles.mb4} />
        <Text preset="label" tx="quick_shares.share_option.quick.dec" />
      </TouchableOpacity>
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 12,
    textAlign: "center",
  },
  mb4: {
    marginBottom: 4,
  },
  mr8: {
    marginRight: 8,
  },
  normalShare: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 4,
    marginTop: 8,
  },
  normalShareContainer: {
    borderBottomWidth: 1,
    marginBottom: 12,
    paddingBottom: 12,
  },
})
