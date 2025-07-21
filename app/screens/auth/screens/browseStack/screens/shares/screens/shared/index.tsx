import { FC, useCallback } from "react"
import { observer } from "mobx-react-lite"
import { StyleSheet } from "react-native"
import { Header, Screen } from "app/components/cores"
import { ShareScreenProps } from "app/navigators"
import { CipherActionsModal, FolderActionsModal, SharedWithYouType } from "app/static/types"
import { SharedWithYouCipherList } from "./SharedWithYouCipherList"
import { CollectionView } from "core/models/view/collectionView"

export const SharedWithYouScreen: FC<ShareScreenProps<"sharedWithYouCipherList">> = observer(
  ({ navigation }) => {
    // ------------------------ PARAMS -------------------------

    // ------------------------ METHODS -------------------------

    const navigateToCipherActions = useCallback((item: SharedWithYouType) => {
      const data: SharedWithYouType = {
        ...item,
        revisionDate: null,
      }
      if (data.isShared) {
        navigation.navigate("pendingSharedCipherModal", {
          cipher: data,
        })
        return
      }
      navigation.navigate("cipherActionsModal", {
        mode: CipherActionsModal.DEFAULT,
        item: data,
        deleteIds: [item.id],
      })
    }, [])

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

    // ------------------------ RENDER -------------------------

    return (
      <Screen
        header={
          <Header
            leftIcon="arrow-left"
            titleTx={"shares:shared_items"}
            onLeftPress={navigation.goBack}
          />
        }
        contentContainerStyle={styles.flex}
      >
        <SharedWithYouCipherList
          openCipherActions={navigateToCipherActions}
          openFolderActions={navigateCollectionActions}
          openCollectionCiphers={navigateToCollectionCiphers}
        />
      </Screen>
    )
  }
)

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})
