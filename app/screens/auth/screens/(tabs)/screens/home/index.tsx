import React, { useState, FC, useCallback, useRef } from "react"
import { MAX_CIPHER_SELECTION } from "app/static/constants"
import { Screen } from "app/components/cores"
import { HomeHeader } from "./HomeHeader"
import { observer } from "mobx-react-lite"
import { HomeSlider } from "./sliderBar/HomeSlider"
import { EmptyCipherList } from "./EmptyCipherList"
import { TabsScreenProps } from "app/navigators"
import { useFetchMarketingContent } from "./useFetchMarketingContent"
import { useHomeBackHandler } from "./useHomeBackHandler"
import { CipherList, SortActionConfigModal, SortConfigType } from "app/components/newCiphers"
import { StyleSheet } from "react-native"
import { CipherType } from "core/enums"
import { AppNotification, CipherActionsModal, CipherAppView } from "app/static/types"

const cipherTypes = [
  CipherType.Card,
  CipherType.Login,
  CipherType.Identity,
  CipherType.CryptoWallet,
  CipherType.MasterPassword,
  CipherType.SecureNote,
]

export const HomeScreen: FC<TabsScreenProps<"homeTab">> = observer(({ navigation }) => {
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

  const navigateToImport = useCallback(() => {
    navigation.navigate("menuStack", {
      screen: "settingsStack",
      params: {
        screen: "import",
      },
    })
  }, [])

  const navigateToAddCipher = useCallback(() => {
    navigation.navigate("addCipherModal")
  }, [])

  const navigateToAppNoti = useCallback((notifications: AppNotification) => {
    navigation.navigate("homeStack", {
      screen: "appListNoti",
      params: {
        notifications,
      },
    })
  }, [])

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

  // ------------------------ EFFECT ----------------------------

  useFetchMarketingContent()
  useHomeBackHandler()
  // -------------- RENDER ------------------

  return (
    <Screen
      safeAreaEdges={["top"]}
      header={
        <HomeHeader
          openAdd={navigateToAddCipher}
          openSort={onOpenSortModal}
          openAppNoti={navigateToAppNoti}
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

      <HomeSlider />

      <CipherList
        cipherTypes={cipherTypes}
        sort={sortConfig.sort}
        isSelecting={isSelecting}
        setIsSelecting={setIsSelecting}
        selectedIds={selectedCipherIds}
        setSelectedIds={setSelectedCipherIds}
        setAllItems={setAllItems}
        openActionsMenu={navigateToCipherActions}
        ListEmptyComponent={
          <EmptyCipherList onAdd={navigateToAddCipher} onImport={navigateToImport} />
        }
      />
    </Screen>
  )
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})
