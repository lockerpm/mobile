import React, { FC, useCallback, useState } from "react"
import { observer } from "mobx-react-lite"
// import { CipherShareList } from "./CipherShareList"
import { useStores } from "app/models"
import { StyleSheet } from "react-native"
import { Screen } from "app/components/cores"
import { ShareStackScreenProps } from "app/navigators"
import { CipherListHeader, SortActionConfigModal, SortConfigType } from "app/components/newCiphers"
import { CipherActionsModal } from "app/static/types"

export const YourShareScreen: FC<ShareStackScreenProps<"yourShare">> = observer(
  ({ navigation }) => {
    const { user } = useStores()

    // --------------------- PARAMS -------------------------

    const [isSortOpen, setIsSortOpen] = useState(false)
    const [sortConfig, setSortConfig] = useState<SortConfigType>({
      sort: {
        orderField: "revisionDate",
        order: "desc",
      },
      option: "last_updated",
    })

    // --------------------- COMPUTED -------------------------

    // --------------------- METHOD -------------------------

    const navigateToAddShareItem = useCallback(() => {
      if (user.isFreePlan) {
        navigation.navigate("cipherActionsModal", {
          mode: CipherActionsModal.PREMIUM_ACTION,
          deleteIds: [],
        })
      }
      // navigation.navigate("moveToFolder")
    }, [user.isFreePlan])

    const onCloseSortModal = useCallback(() => {
      setIsSortOpen(false)
    }, [])

    const onOpenSortModal = useCallback(() => {
      setIsSortOpen(true)
    }, [])
    // --------------------- EFFECTS -------------------------

    // --------------------- RENDER -------------------------

    return (
      <Screen
        safeAreaEdges={["top"]}
        header={
          <CipherListHeader
            headerTx="shares.share_items"
            openSort={onOpenSortModal}
            openAdd={navigateToAddShareItem}
            isSelecting={false}
            selectedCount={0}
            goBack={navigation.goBack}
          />
        }
        contentContainerStyle={styles.flex}
      >
        <SortActionConfigModal
          isOpen={isSortOpen}
          onClose={onCloseSortModal}
          onSelectSortConfig={setSortConfig}
          option={sortConfig.option}
        />
        {/* <CipherShareList
          navigation={navigation}
          onLoadingChange={setIsLoading}
          searchText={searchText}
          sortList={sortList}
          emptyContent={
            isFreeAccount ? (
              <EmptyCipherList
                img={SHARE_EMPTY}
                imgStyle={{ height: 55, width: 55 }}
                title={translate("shares.empty.title")}
                desc={translate("error.not_available_for_free")}
                buttonText={translate("common.upgrade")}
                addItem={() => {
                  navigation.navigate("payment")
                }}
              />
            ) : (
              <EmptyCipherList
                img={SHARE_EMPTY}
                imgStyle={{ height: 55, width: 55 }}
                title={translate("shares.empty.title")}
                desc={translate("shares.empty.desc_share")}
                buttonText={translate("shares.start_sharing")}
                addItem={() => navigation.navigate("shareMultiple")}
              />
            )
          }
        /> */}
      </Screen>
    )
  },
)

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})
