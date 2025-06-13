import React, { FC, useCallback, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { StyleSheet } from "react-native"
import { Screen } from "app/components/cores"
import { MAX_CIPHER_SELECTION } from "app/static/constants"
import { ShareStackScreenProps } from "app/navigators"
import { CipherListHeader, SortActionConfigModal, SortConfigType } from "app/components/newCiphers"
import { CipherActionsModal, CipherAppView } from "app/static/types"
import { SharedWithYouCipherList } from "./SharedWithYouCipherList"

export const SharedWithYouScreen: FC<ShareStackScreenProps<"sharedWithYou">> = observer(
  ({ navigation }) => {
    // ------------------------ PARAMS -------------------------

    const [isSortOpen, setIsSortOpen] = useState(false)
    const [sortConfig, setSortConfig] = useState<SortConfigType>({
      sort: {
        orderField: "revisionDate",
        order: "desc",
      },
      option: "last_updated",
    })

    const allCipherIds = useRef<string[]>([])
    const [isSelecting, setIsSelecting] = useState(false)
    const [selectedCipherIds, setSelectedCipherIds] = useState<string[]>([])

    // ------------------------ METHODS -------------------------
    const toggleSelectAll = useCallback(() => {
      const maxLength = Math.min(allCipherIds.current.length, MAX_CIPHER_SELECTION)
      if (selectedCipherIds.length < maxLength) {
        setSelectedCipherIds(allCipherIds.current.slice(0, maxLength))
      } else {
        setSelectedCipherIds([])
      }
    }, [selectedCipherIds, setSelectedCipherIds])

    const setAllItems = useCallback((ids: string[]) => {
      allCipherIds.current = ids
    }, [])

    const navigateToFolder = useCallback(() => {
      // navigation.navigate("moveToFolder")
    }, [])

    const openDelete = useCallback(() => {
      navigation.navigate("cipherActionsModal", {
        mode: CipherActionsModal.DELETE,
        deleteIds: selectedCipherIds,
      })
    }, [selectedCipherIds])

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

    const clearSelect = useCallback(() => {
      setIsSelecting(false)
      setSelectedCipherIds([])
    }, [])

    const onCloseSortModal = useCallback(() => {
      setIsSortOpen(false)
    }, [])

    const onOpenSortModal = useCallback(() => {
      setIsSortOpen(true)
    }, [])

    // ------------------------ RENDER -------------------------

    return (
      <Screen
        safeAreaEdges={["top"]}
        header={
          <CipherListHeader
            //  isShared
            headerTx={"shares.shared_items"}
            goBack={navigation.goBack}
            openSort={onOpenSortModal}
            openMoveToFolder={navigateToFolder}
            openDelete={openDelete}
            isSelecting={isSelecting}
            selectedCount={selectedCipherIds.length}
            clearSelect={clearSelect}
            toggleSelectAll={toggleSelectAll}
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

        <SharedWithYouCipherList
          sort={sortConfig.sort}
          isSelecting={isSelecting}
          setIsSelecting={setIsSelecting}
          selectedIds={selectedCipherIds}
          setSelectedIds={setSelectedCipherIds}
          setAllItems={setAllItems}
          openActionsMenu={navigateToCipherActions}
        />
      </Screen>
    )
  },
)

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})
