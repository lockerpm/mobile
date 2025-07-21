import { useStores } from "@/models"
import { CipherAppView } from "@/static/types"
import { FlatList, View, ViewStyle } from "react-native"
import { ShareCipher } from "./ShareCipher"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

type Props = {
  ciphers: CipherAppView[]
  removeShareCipher: (item: CipherAppView) => void
}

export const ShareCipherList = ({ ciphers, removeShareCipher }: Props) => {
  const { cipherStore } = useStores()
  const { themed } = useAppTheme()
  // check if cipher is shared from other user
  // if true, show shared icon
  const isShared = (organizationId: string | null) => {
    if (!organizationId) return false
    const share = cipherStore.myShares.find((s) => s.id === organizationId)
    if (share) {
      return share.members.length > 0 || share.groups.length > 0
    }
    return !!organizationId
  }

  return (
    <View style={themed($container)}>
      <FlatList
        data={ciphers}
        renderItem={({ item }) => (
          <ShareCipher
            item={item}
            onRemove={removeShareCipher}
            isShared={isShared(item.organizationId)}
          />
        )}
        ItemSeparatorComponent={() => <View style={themed($divider)} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  )
}
const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.border,
  height: 1,
})

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  maxHeight: 300,
  borderRadius: 12,
  borderColor: colors.border,
  borderWidth: 1,
})
