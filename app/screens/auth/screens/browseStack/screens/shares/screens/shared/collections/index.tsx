import { FlatList, StyleSheet, View, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

import { CollectionItem, EmptyCipherList } from "app/components/ciphers"
import { SearchBar } from "app/components/utils"
import { ShareScreenProps } from "app/navigators"
import { FolderActionsModal } from "app/static/types"
import { CollectionView } from "core/models/view/collectionView"

import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

import { useSearch } from "../../useSearch"
import { FolderItemType } from "../useSharedWithYou"

const SHARE_EMPTY = require("assets/images/emptyCipherList/share-empty-img.png")

type Props = {
  data: FolderItemType[]
}

export const SharedCollectionList = observer(({ data }: Props) => {
  const { themed } = useAppTheme()
  const navigation = useNavigation<ShareScreenProps<"sharedWithYouCipherList">["navigation"]>()

  const { searchText, setSearchText, filtered } = useSearch(data, (item) => item.data.name ?? "")

  // ------------------------ METHODS ----------------------------

  const openCollectionCiphers = (collectionId: string, orgId: string, name: string) => {
    navigation.navigate("cipherList", {
      header: name,
      collectionId,
      organizationId: orgId,
    })
  }

  const openFolderActions = (collection: CollectionView, acceptedTime?: number) => {
    navigation.navigate("folderActionModal", {
      mode: FolderActionsModal.DEFAULT,
      collection,
      acceptedTime,
    })
  }

  // ------------------------ RENDER ----------------------------

  return (
    <View style={styles.flex}>
      <SearchBar value={searchText} onChangeText={setSearchText} containerStyle={styles.search} />
      <FlatList
        contentContainerStyle={styles.content}
        data={filtered}
        keyExtractor={(_item, index) => String(index)}
        renderItem={({ item }) => (
          <CollectionItem
            isYourSharedScreen
            acceptedTime={item.acceptedTime}
            item={item.data}
            openCollectionCipher={openCollectionCiphers}
            openAction={openFolderActions}
          />
        )}
        ItemSeparatorComponent={() => <View style={themed($divider)} />}
        ListEmptyComponent={
          <EmptyCipherList
            image={SHARE_EMPTY}
            titleTx="shares:empty.title"
            descTx="shares:empty.desc_shared"
          />
        }
      />
    </View>
  )
})

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.border,
})

const styles = StyleSheet.create({
  content: {
    paddingBottom: 8 + StaticSafeAreaInsets.safeAreaInsetsBottom,
    paddingHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
  search: {
    marginBottom: 8,
    marginHorizontal: 16,
    marginTop: 16,
  },
})
