import React, { useCallback, useState } from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { QuickSharesList } from "./QuickSharesList"
import { useStores } from "app/models"
import { Screen } from "app/components/cores"
import { useAppLocale } from "app/services/context"
import { CipherListHeader, SortActionConfigModal, SortConfigType } from "app/components/newCiphers"

const SHARE_EMPTY = require("assets/images/emptyCipherList/share-empty-img.png")

export const QuickShareItemsScreen = observer(() => {
  const navigation = useNavigation() as any
  const { user } = useStores()
  const { translate } = useAppLocale()
  // --------------------- PARAMS -------------------------

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfigType>({
    sort: {
      orderField: "revisionDate",
      order: "desc",
    },
    option: "last_updated",
  })

  const onCloseSortModal = useCallback(() => {
    setIsSortOpen(false)
  }, [])

  const onOpenSortModal = useCallback(() => {
    setIsSortOpen(true)
  }, [])

  // --------------------- COMPUTED -------------------------

  const isFreeAccount = user.isFreePlan

  // --------------------- EFFECTS -------------------------

  // --------------------- RENDER -------------------------

  return (
    <Screen
      safeAreaEdges={["top"]}
      header={
        <CipherListHeader
          headerTx={"quick_shares.share_option.quick.tl"}
          goBack={navigation.goBack}
          openSort={onOpenSortModal}
          selectedCount={0}
          isSelecting={false}
        />
      }
      contentContainerStyle={{
        flex: 1,
      }}
    >
      <SortActionConfigModal
        isOpen={isSortOpen}
        onClose={onCloseSortModal}
        onSelectSortConfig={setSortConfig}
        option={sortConfig.option}
      />

      <QuickSharesList
        navigation={navigation}
        onLoadingChange={setIsLoading}
        searchText={searchText}
        sortList={sortList}
        // emptyContent={
        //   isFreeAccount ? (
        //     <EmptyCipherList
        //       img={SHARE_EMPTY}
        //       imgStyle={{ height: 55, width: 55 }}
        //       title={translate("shares.empty.title")}
        //       desc={translate("error.not_available_for_free")}
        //       buttonText={translate("common.upgrade")}
        //       addItem={() => {
        //         navigation.navigate("payment")
        //       }}
        //     />
        //   ) : (
        //     <EmptyCipherList
        //       img={SHARE_EMPTY}
        //       imgStyle={{ height: 55, width: 55 }}
        //       title={translate("shares.empty.title")}
        //       desc={translate("shares.empty.desc_share")}
        //       buttonText={translate("shares.start_sharing")}
        //       addItem={() => navigation.navigate("mainTab", { screen: "homeTab" })}
        //     />
        //   )
        // }
      />
    </Screen>
  )
})
