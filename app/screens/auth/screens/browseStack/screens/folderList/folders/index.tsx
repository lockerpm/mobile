import { useState, useCallback } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, StyleSheet, Image, View, ViewStyle } from "react-native"
import { Button, Text } from "app/components/cores"
import { useStores } from "app/models"
import { FolderView } from "core/models/view/folderView"
import { BrowseScreenProps } from "app/navigators"
import { SearchBar } from "app/components/utils"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { useNavigation } from "@react-navigation/native"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { FolderActionsModal } from "@/static/types"
import { FolderItem } from "@/components/ciphers"

const EMPTY = require("assets/images/emptyCipherList/folder-empty-img.png")

function getFilteredData<T extends { name: string }>(items: T[], searchText: string) {
  const filtered = items.filter((item: T) => {
    if (searchText) {
      return item.name.toLowerCase().includes(searchText.toLowerCase())
    }
    return true
  })
  return filtered
}

export const FolderList = observer(() => {
  const { themed } = useAppTheme()
  const { folderStore } = useStores()
  const navigation = useNavigation<BrowseScreenProps<"folderList">["navigation"]>()

  const initFolders: FolderView[] = [...folderStore.folders].sort((a, _) => (a.name ? 1 : -1))

  // ------------------- PARAMS ---------------------

  const [searchText, setSearchText] = useState("")

  // ------------------- COMPUTED ---------------------

  const folders: FolderView[] = getFilteredData(initFolders, searchText)

  // ------------------- METHODS ---------------------
  const navigateToFolderCiphers = useCallback((folderId: string, name: string) => {
    navigation.navigate("cipherList", {
      folderId,
      header: name,
    })
  }, [])

  const navigateFolderActions = useCallback(
    (folder: FolderView) => {
      navigation.navigate("folderActionModal", {
        mode: FolderActionsModal.DEFAULT,
        folder,
      })
    },
    [navigation]
  )

  const navigateToCreateFolder = useCallback(() => {
    navigation.navigate("folderActionModal", {
      mode: FolderActionsModal.CREATE,
    })
  }, [navigation])

  // ------------------- RENDER ---------------------

  const ItemSperator = useCallback(() => <View style={themed($divider)} />, [])

  return (
    <View style={styles.flex}>
      <SearchBar value={searchText} onChangeText={setSearchText} containerStyle={styles.search} />
      <FlatList
        data={folders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ph16}
        renderItem={({ item }) => (
          <FolderItem
            item={item}
            openFolderCipher={navigateToFolderCiphers}
            openAction={navigateFolderActions}
          />
        )}
        ItemSeparatorComponent={ItemSperator}
        ListEmptyComponent={
          <View style={styles.container}>
            <Image source={EMPTY} resizeMode="contain" style={styles.image} />
            <Text preset="bold" size="lg" style={styles.title} tx={"folder:empty.title"} />
            <Text preset="label" tx={"folder:empty.desc"} size="sm" style={styles.label} />
            <Button tx={"folder:empty.btn"} onPress={navigateToCreateFolder} />
          </View>
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
  container: {
    alignItems: "center",
    marginTop: "10%",
    paddingHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
  image: {
    height: 55,
    width: 120,
  },
  label: {
    marginVertical: 12,
    textAlign: "center",
  },
  ph16: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom + 16,
    paddingHorizontal: 16,
  },
  search: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  title: {
    marginTop: 10,
    textAlign: "center",
  },
})
