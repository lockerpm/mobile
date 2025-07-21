import { BottomModal, Icon, PressableScale, Text } from "@/components/cores"
import { ThemedStyle } from "@/theme"
import { CHAIN_LIST } from "@/utils/crypto/chainlist"
import { useAppTheme } from "@/utils/useAppTheme"
import { FlatList, View, ViewStyle, StyleSheet, Image } from "react-native"

type Props = {
  isOpen: boolean
  onClose: () => void
  chain: {
    alias: string
    name: string
  }[]
  setChain: (items: { alias: string; name: string }) => void
}

export const otherLogo = require("assets/images/icons/crypto/crypto-wallet.png")

export const WalletChainsModal = ({ isOpen, onClose, chain, setChain }: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      tx={"crypto_asset:wallet_app"}
      contentContainer={$content}
    >
      <FlatList
        bounces={false}
        data={CHAIN_LIST}
        keyExtractor={(item) => item.alias}
        renderItem={({ item }) => (
          <PressableScale onPress={() => setChain(item)}>
            <View style={styles.item}>
              <Image
                resizeMode="contain"
                source={item?.logo || otherLogo}
                borderRadius={20}
                style={styles.image}
              />
              <Text text={item.name} style={styles.label} />
              {chain?.find((c) => c.alias === item.alias) && (
                <Icon icon="check" color={colors.primary} size={24} />
              )}
            </View>
          </PressableScale>
        )}
        ItemSeparatorComponent={() => <View style={themed($divider)} />}
        contentContainerStyle={styles.contentContainer}
      />
    </BottomModal>
  )
}

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.border,
})

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
  },
  image: {
    borderRadius: 20,
    height: 34,
    marginRight: 12,
    width: 34,
  },
  item: {
    alignItems: "center",
    flexDirection: "row",
    height: 52.2,
    paddingVertical: 15,
  },
  label: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
})

const $content: ViewStyle = {
  padding: 0,
  maxHeight: "auto",
  height: 600,
  paddingHorizontal: 0,
}
