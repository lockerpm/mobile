import React, { useState, FC, useCallback } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, StyleSheet, Image, View } from "react-native"
import { Button, Header, Screen, Text } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"
import { useStores } from "app/models"
import { FolderView } from "core/models/view/folderView"
import { CollectionView } from "core/models/view/collectionView"
import { BrowseStackScreenProps } from "app/navigators"
import { FolderItem } from "./FolderItem"
import { CollectionItem } from "./CollectionItem"
import { SearchBar } from "app/components/utils"

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

export const FolderListScreen: FC<BrowseStackScreenProps<"folderList">> = observer(
  ({ navigation }) => {
    const { colors } = useTheme()
    const { translate } = useAppLocale()
    const { folderStore, collectionStore } = useStores()

    const initFolders: FolderView[] = [...folderStore.folders]
    const initCollections: CollectionView[] = [...collectionStore.collections]

    // ------------------- PARAMS ---------------------

    const [searchText, setSearchText] = useState("")

    // ------------------- COMPUTED ---------------------

    const folders: FolderView[] = getFilteredData(initFolders, searchText)
    const collections: CollectionView[] = getFilteredData(initCollections, searchText)

    // ------------------- METHODS ---------------------
    const navigateToFolderCiphers = useCallback((folderId: string) => {
      navigation.navigate("cipherList", {
        folderId,
      })
    }, [])

    const navigateToCollectionCiphers = useCallback((collectionId: string, orgId: string) => {
      navigation.navigate("cipherList", {
        collectionId,
        organizationId: orgId,
      })
    }, [])

    const navigateFolderActions = useCallback(() => {
      // setIsActionOpen(true)
    }, [])

    const navigateToCreateFolder = useCallback(() => {
      //
    }, [])
    // ------------------- RENDER ---------------------

    const ItemSperator = useCallback(
      () => <View style={{ width: "100%", height: 1, backgroundColor: colors.border }} />,
      [],
    )

    return (
      <Screen
        safeAreaEdges={["bottom"]}
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx="common.folders"
            rightIcon="plus"
            onRightPress={navigateToCreateFolder}
          />
        }
        contentContainerStyle={styles.flex}
      >
        {folders.length > 5 && (
          <SearchBar value={searchText} onChangeText={setSearchText} containerStyle={styles.mh16} />
        )}
        <View style={styles.flex}>
          <FlatList
            data={folders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.ph16}
            ListHeaderComponent={() => (
              <Text
                preset="label"
                size="base"
                text={`${translate("common.folder")} (${folders.length})`}
              />
            )}
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
                <Text preset="bold" size="large" style={styles.title} tx={"folder.empty.title"} />
                <Text preset="label" tx={"folder.empty.desc"} size="base" style={styles.label} />
                <Button tx={"folder.empty.btn"} onPress={navigateToCreateFolder} />
              </View>
            }
          />
        </View>

        {collections.length > 0 && (
          <View style={styles.flex}>
            <FlatList
              data={collections}
              contentContainerStyle={styles.ph16}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={() => (
                <Text
                  preset="label"
                  size="base"
                  text={`${translate("shares.shared_folder")} (${collections.length})`}
                  style={styles.pt16}
                />
              )}
              renderItem={({ item }) => (
                <CollectionItem
                  item={item}
                  openCollectionCipher={navigateToCollectionCiphers}
                  openAction={navigateFolderActions}
                />
              )}
              ItemSeparatorComponent={ItemSperator}
            />
          </View>
        )}
      </Screen>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: "10%",
    paddingHorizontal: 20,
  },
  flex: {
    flex: 1,
  },
  image: {
    height: 55,
    width: 120,
  },
  label: {
    lineHeight: 21,
    textAlign: "center",
  },
  mh16: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  ph16: {
    paddingHorizontal: 16,
  },
  pt16: {
    paddingTop: 16,
  },
  title: {
    marginBottom: 8,
    marginTop: 10,
    textAlign: "center",
  },
})
