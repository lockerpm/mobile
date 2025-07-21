import { useState, useCallback } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, StyleSheet, View, ViewStyle } from "react-native"
import { useStores } from "app/models"
import { CollectionView } from "core/models/view/collectionView"
import { BrowseScreenProps } from "app/navigators"
import { SearchBar } from "app/components/utils"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { useNavigation } from "@react-navigation/native"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { FolderActionsModal } from "@/static/types"
import { CollectionItem } from "@/components/ciphers"

function getFilteredData<T extends { name: string }>(items: T[], searchText: string) {
  const filtered = items.filter((item: T) => {
    if (searchText) {
      return item.name.toLowerCase().includes(searchText.toLowerCase())
    }
    return true
  })
  return filtered
}

export const CollectionList = observer(() => {
  const { themed } = useAppTheme()
  const { collectionStore } = useStores()

  const navigation = useNavigation<BrowseScreenProps<"folderList">["navigation"]>()

  const initCollections: CollectionView[] = [...collectionStore.collections]

  // ------------------- PARAMS ---------------------

  const [searchText, setSearchText] = useState("")

  // ------------------- COMPUTED ---------------------

  const collections: CollectionView[] = getFilteredData(initCollections, searchText)

  // ------------------- METHODS ---------------------

  const navigateToCollectionCiphers = useCallback(
    (collectionId: string, orgId: string, name: string) => {
      navigation.navigate("cipherList", {
        header: name,
        collectionId,
        organizationId: orgId,
      })
    },
    [navigation]
  )

  const navigateCollectionActions = useCallback(
    (collection: CollectionView) => {
      navigation.navigate("folderActionModal", {
        mode: FolderActionsModal.DEFAULT,
        collection,
      })
    },
    [navigation]
  )

  // ------------------- RENDER ---------------------

  const ItemSperator = useCallback(() => <View style={themed($divider)} />, [])

  return (
    <View style={styles.flex}>
      <SearchBar value={searchText} onChangeText={setSearchText} containerStyle={styles.search} />
      <FlatList
        data={collections}
        contentContainerStyle={styles.ph16}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CollectionItem
            item={item}
            openCollectionCipher={navigateToCollectionCiphers}
            openAction={navigateCollectionActions}
          />
        )}
        ItemSeparatorComponent={ItemSperator}
      />
    </View>
  )
})

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.border,
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  ph16: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom + 16,
    paddingHorizontal: 16,
  },
  search: {
    marginHorizontal: 16,
    marginTop: 16,
  },
})
