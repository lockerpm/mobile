import { BottomModal, Icon, PressableScale, Text } from "@/components/cores"
import { SearchBar } from "@/components/utils"
import { ThemedStyle } from "@/theme"
import { WALLET_APP_LIST } from "@/utils/crypto/applist"
import { useAppTheme } from "@/utils/useAppTheme"
import { useCallback, useState } from "react"
import { FlatList, View, ViewStyle, StyleSheet, Image } from "react-native"

type Props = {
  isOpen: boolean
  onClose: () => void
  alias: string
  setAlias: (app: { alias: string; name: string }) => void
}

export const otherLogo = require("assets/images/icons/crypto/crypto-wallet.png")

export const WalletAppsModal = ({ isOpen, onClose, alias, setAlias }: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const [searchText, setSearchText] = useState("")

  const data = !searchText
    ? WALLET_APP_LIST
    : WALLET_APP_LIST.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()))

  const clear = useCallback(() => {
    setSearchText("")
  }, [])
  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      tx={"crypto_asset:wallet_app"}
      contentContainer={$content}
      onDismiss={clear}
    >
      <FlatList
        bounces={false}
        data={data}
        ListHeaderComponent={<SearchBar value={searchText} onChangeText={setSearchText} />}
        keyExtractor={(item) => item.alias}
        renderItem={({ item }) => (
          <PressableScale
            onPress={() => {
              setAlias(item)
            }}
          >
            <View style={styles.item}>
              <Image
                resizeMode="contain"
                source={item?.logo || otherLogo}
                borderRadius={20}
                style={styles.image}
              />
              <Text text={item.name} style={styles.label} />
              {item.alias === alias && <Icon icon="check" color={colors.primary} size={24} />}
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
