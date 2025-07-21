import { StyleSheet, View } from "react-native"
import { Text, BottomModalContainer, BottomModalHeader, PressableScale } from "app/components/cores"
import { useStores } from "app/models"
import { CipherActionsModal, CipherAppView } from "app/static/types"
import { PremiumTag } from "app/components/utils"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { AuthScreenProps } from "@/navigators"
import { delay } from "@/utils/delay"

interface Props {
  onClose: () => void
  setNextModal: (action: CipherActionsModal) => void
  cipher: CipherAppView
}

export const ShareOptions = ({ cipher, onClose, setNextModal }: Props) => {
  const navigation = useNavigation<AuthScreenProps<"cipherActionsModal">["navigation"]>()
  const {
    theme: { colors },
  } = useAppTheme()
  const { user } = useStores()
  // --------------------PARAMS---------------------
  const premiumLock = user.isFreePlan

  // --------------------METHODS---------------------

  const quickShare = () => {
    onClose()
    delay(30).then(() => {
      navigation.navigate("browseStack", {
        screen: "shareStack",
        params: {
          screen: "quickShares",
          params: {
            cipher,
          },
        },
      })
    })
  }

  const normalShare = () => {
    if (premiumLock) {
      setNextModal(CipherActionsModal.PREMIUM_ACTION)
    } else {
      onClose()
      delay(30).then(() => {
        navigation.navigate("browseStack", {
          screen: "shareStack",
          params: {
            screen: "normalShare",
            params: {
              ciphers: [cipher],
            },
          },
        })
      })
    }
  }

  return (
    <BottomModalContainer>
      <BottomModalHeader tx="quick_shares:share_option.title" onClose={onClose} />
      <PressableScale
        onPress={normalShare}
        style={[
          styles.normalShareContainer,
          {
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.normalShare}>
          <Text preset="bold" tx={"quick_shares:share_option.normal.tl"} style={styles.mr8} />
          {premiumLock && <PremiumTag />}
        </View>

        <Text preset="label" tx="quick_shares:share_option.normal.dec" />
      </PressableScale>
      <PressableScale onPress={quickShare} style={styles.container}>
        <Text preset="bold" tx="quick_shares:share_option.quick.tl" style={styles.mb4} />
        <Text preset="label" tx="quick_shares:share_option.quick.dec" />
      </PressableScale>
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
  },
})
