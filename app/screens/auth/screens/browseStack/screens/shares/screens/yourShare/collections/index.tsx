import { FlatList, StyleSheet, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

import { EmptyCipherList } from "app/components/ciphers"
import { SearchBar } from "app/components/utils"
import { ConfirmShareItemInfo, FolderShareType, SharedMemberType } from "app/static/types"
import { CollectionView } from "core/models/view/collectionView"

import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

import { useSearch } from "../../useSearch"
import { YourShareCollectionItem } from "../YourShareCollectionItem"

const SHARE_EMPTY = require("assets/images/emptyCipherList/share-empty-img.png")

type Props = {
  data: FolderShareType[]
  isFreeAccount: boolean
  openAdd: () => void
  openAction: (collection: CollectionView) => void
  openConfirmModal: (
    item: ConfirmShareItemInfo,
    members: SharedMemberType[],
    organizationId: string
  ) => void
}

export const YourShareCollectionList = observer(
  ({ data, isFreeAccount, openAdd, openAction, openConfirmModal }: Props) => {
    const { themed } = useAppTheme()
    const { searchText, setSearchText, filtered } = useSearch(
      data,
      (item) => item.collection.name ?? ""
    )

    return (
      <View style={styles.flex}>
        <SearchBar value={searchText} onChangeText={setSearchText} containerStyle={styles.search} />
        <FlatList
          contentContainerStyle={styles.content}
          data={filtered}
          keyExtractor={(_item, index) => String(index)}
          renderItem={({ item }) => (
            <YourShareCollectionItem
              item={item}
              openAction={openAction}
              openConfirmModal={openConfirmModal}
            />
          )}
          ItemSeparatorComponent={() => <View style={themed($divider)} />}
          ListEmptyComponent={
            <EmptyCipherList
              image={SHARE_EMPTY}
              titleTx="shares:empty.title"
              descTx={isFreeAccount ? "error:not_available_for_free" : "shares:empty.desc_share"}
              buttonTx={isFreeAccount ? "common:upgrade" : "shares:start_sharing"}
              addItem={openAdd}
            />
          }
        />
      </View>
    )
  }
)

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
