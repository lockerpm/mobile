import React, { useState, FC, useCallback, useRef } from "react"
import { MAX_CIPHER_SELECTION } from "app/static/constants"
import { Screen } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { BrowseStackScreenProps } from "app/navigators"
import { CipherList, SortActionConfigModal, SortConfigType } from "app/components/newCiphers"
import { StyleSheet } from "react-native"
import { CipherActionsModal, CipherAppView } from "app/static/types"
import { CipherListHeader } from "./CipherListHeader"
import { CipherListEmpty } from "./CipherListEmpty"
import { CipherType } from "core/enums"

const allTypes = [
  CipherType.Card,
  CipherType.Login,
  CipherType.Identity,
  CipherType.CryptoWallet,
  CipherType.MasterPassword,
  CipherType.SecureNote,
]
/**
 * Render the Cipher List screen with target ciphertype
 */
export const CipherListScreen: FC<BrowseStackScreenProps<"cipherList">> = observer(
  ({
    navigation,
    route: {
      params: { cipherTypes = allTypes, header },
    },
  }) => {
    // -------------- PARAMS ------------------
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

    // ------------------------ METHODS ------------------------

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

    const navigateToAddCipher = useCallback(() => {
      if (cipherTypes.length > 2) {
        navigation.navigate("addCipherModal")
      }
    }, [cipherTypes])

    const navigateToFolder = useCallback(() => {
      // navigation.navigate("moveToFolder")
    }, [])

    const navigateToShare = useCallback(() => {
      // navigation.navigate("moveToFolder")
    }, [])

    const navigateToDelete = useCallback(() => {
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

    const onCloseSortModal = useCallback(() => {
      setIsSortOpen(false)
    }, [])

    const onOpenSortModal = useCallback(() => {
      setIsSortOpen(true)
    }, [])

    // -------------- RENDER ------------------

    return (
      <Screen
        safeAreaEdges={["top"]}
        header={
          <CipherListHeader
            header={header}
            goBack={navigation.goBack}
            openAdd={navigateToAddCipher}
            openSort={onOpenSortModal}
            openMoveToFolder={navigateToFolder}
            openShare={navigateToShare}
            openDelete={navigateToDelete}
            isSelecting={isSelecting}
            setIsSelecting={setIsSelecting}
            selectedItems={selectedCipherIds}
            setSelectedItems={setSelectedCipherIds}
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

        <CipherList
          safeBottom
          cipherTypes={cipherTypes}
          sort={sortConfig.sort}
          isSelecting={isSelecting}
          setIsSelecting={setIsSelecting}
          selectedIds={selectedCipherIds}
          setSelectedIds={setSelectedCipherIds}
          setAllItems={setAllItems}
          openActionsMenu={navigateToCipherActions}
          ListEmptyComponent={
            <CipherListEmpty cipherTypes={cipherTypes} onAdd={navigateToAddCipher} />
          }
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
