import React, { useState, useCallback, useRef } from "react"
import { MAX_CIPHER_SELECTION } from "app/static/constants"
import { Screen } from "app/components/cores"
import { observer } from "mobx-react-lite"
import {
  CipherList,
  CipherListHeader,
  SortActionConfigModal,
  SortConfigType,
} from "app/components/newCiphers"
import { StyleSheet } from "react-native"
import { CipherActionsModal, CipherAppView } from "app/static/types"
import { CipherType } from "core/enums"
import { useStores } from "app/models"
import { useCipherData } from "app/services/hook"

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
export const ShareMultipleCipehrScreen = observer(
  ({
    navigation,
    route: {
      params: { cipherTypes = allTypes },
    },
  }) => {
    const { user } = useStores()
    const { restoreCiphers } = useCipherData()
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
      if (user.isFreePlan) {
        navigation.navigate("cipherActionsModal", {
          mode: CipherActionsModal.PREMIUM_ACTION,
          deleteIds: [],
        })
      }
      // navigation.navigate("moveToFolder")
    }, [user.isFreePlan])

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

    const handleRestore = useCallback(async () => {
      const res = await restoreCiphers(selectedCipherIds)
      if (res.kind === "ok") {
        clearSelect()
      }
    }, [selectedCipherIds])
    // -------------- RENDER ------------------

    return (
      <Screen
        safeAreaEdges={["top"]}
        header={
          <CipherListHeader
            goBack={navigation.goBack}
            openAdd={navigateToAddCipher}
            openSort={onOpenSortModal}
            openMoveToFolder={navigateToFolder}
            openShare={navigateToShare}
            openDelete={openDelete}
            isSelecting={isSelecting}
            selectedCount={selectedCipherIds.length}
            handleRestore={handleRestore}
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
