import { FC, useCallback } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { StyleSheet } from "react-native"
import { Header, Screen } from "app/components/cores"
import { ShareScreenProps } from "app/navigators"
import {
  CipherActionsModal,
  CipherAppView,
  CipherShareType,
  FolderActionsModal,
} from "app/static/types"
import { CollectionView } from "core/models/view/collectionView"
import { YourShareCipherList } from "./YourShareCipherList"

export const YourShareScreen: FC<ShareScreenProps<"yourShareCipherList">> = observer(
  ({ navigation }) => {
    const { user } = useStores()

    // --------------------- METHOD -------------------------

    const navigateToAddShareItem = useCallback(() => {
      if (user.isFreePlan) {
        navigation.navigate("cipherActionsModal", {
          mode: CipherActionsModal.PREMIUM_ACTION,
          deleteIds: [],
        })
      }
      navigation.navigate("mainTab", {
        screen: "homeTab",
      })
    }, [navigation, user.isFreePlan])

    const navigateToCipherActions = useCallback((item: CipherAppView) => {
      const data: CipherAppView = {
        ...item,
        revisionDate: null,
      }
      navigation.navigate("cipherActionsModal", {
        mode: CipherActionsModal.DEFAULT,
        item: data,
        deleteIds: [item.id],
      })
    }, [])

    const navigateToShareConfirmModal = useCallback((item: CipherShareType) => {
      if (!!item.member && item.organizationId) {
        navigation.navigate("confirmYourShareModal", {
          member: item.member,
          organizationId: item.organizationId,
        })
      }
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

    // --------------------- EFFECTS -------------------------

    // --------------------- RENDER -------------------------

    return (
      <Screen
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx="shares:share_items"
            // rightIcon="plus"
            // onRightPress={navigateToAddShareItem}
          />
        }
        contentContainerStyle={styles.flex}
      >
        <YourShareCipherList
          openAdd={navigateToAddShareItem}
          openCollectionAction={navigateCollectionActions}
          openCipherAction={navigateToCipherActions}
          openCollectionCiphers={navigateToCollectionCiphers}
          openShowConfirmModal={navigateToShareConfirmModal}
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
