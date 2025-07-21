import { useState, FC, useCallback, useRef, useEffect } from "react"
import { MAX_CIPHER_SELECTION } from "app/static/constants"
import { Screen } from "app/components/cores"
import { HomeHeader } from "./HomeHeader"
import { observer } from "mobx-react-lite"
import { HomeSlider } from "./sliderBar/HomeSlider"
import { HomeEmpty } from "./HomeEmpty"
import { TabsScreenProps } from "app/navigators"
import { useFetchMarketingContent } from "./useFetchMarketingContent"
import { useHomeBackHandler } from "./useHomeBackHandler"
import { CipherList, SortActionConfigModal, SortConfigType } from "app/components/ciphers"
import { StyleSheet } from "react-native"
import { CipherType } from "core/enums"
import { AppNotification, CipherActionsModal, CipherAppView } from "app/static/types"
import { useStores } from "@/models"
import { AppEventType, EventBus } from "@/utils/eventBus"

const allCipherType = [
  CipherType.Card,
  CipherType.Login,
  CipherType.Identity,
  CipherType.CryptoWallet,
  CipherType.MasterPassword,
  CipherType.SecureNote,
]

export const HomeScreen: FC<TabsScreenProps<"homeTab">> = observer(({ navigation }) => {
  const { user } = useStores()

  const cipherTypes = user.hide_master_password
    ? allCipherType.filter((type) => type !== CipherType.MasterPassword)
    : allCipherType

  // -------------- PARAMS ------------------
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfigType>({
    sort: {
      orderField: "revisionDate",
      order: "desc",
    },
    option: "last_updated",
  })

  const allCipher = useRef<CipherAppView[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedCiphers, setSelectedCiphers] = useState<CipherAppView[]>([])

  const selectedCipherIds = selectedCiphers.map((item) => item.id)
  // ------------------------ METHODS ------------------------

  const clearSelect = useCallback(() => {
    setIsSelecting(false)
    setSelectedCiphers([])
  }, [])

  const toggleSelectAll = useCallback(() => {
    const maxLength = Math.min(allCipher.current.length, MAX_CIPHER_SELECTION)
    if (selectedCipherIds.length < maxLength) {
      setSelectedCiphers(allCipher.current.slice(0, maxLength))
    } else {
      setSelectedCiphers([])
    }
  }, [selectedCipherIds, setSelectedCiphers])

  const setAllItems = useCallback((ids: CipherAppView[]) => {
    allCipher.current = ids
  }, [])

  const navigateToImport = useCallback(() => {
    navigation.navigate("menuStack", {
      screen: "settingsStack",
      params: {
        screen: "import",
      },
    })
  }, [navigation])

  const navigateToAddCipher = useCallback(() => {
    navigation.navigate("addCipherModal")
  }, [navigation])

  const navigateToAppNoti = useCallback(
    (notifications: AppNotification) => {
      navigation.navigate("homeStack", {
        screen: "appListNoti",
        params: {
          notifications,
        },
      })
    },
    [navigation]
  )

  const navigateToFolder = useCallback(() => {
    navigation.navigate("browseStack", {
      screen: "folderSelect",
      params: {
        mode: "move",
        cipherIds: selectedCipherIds,
      },
    })
  }, [navigation, selectedCipherIds])

  const navigateToShare = useCallback(() => {
    if (user.isFreePlan) {
      navigation.navigate("cipherActionsModal", {
        mode: CipherActionsModal.PREMIUM_ACTION,
        deleteIds: [],
      })
      return
    }
    navigation.navigate("browseStack", {
      screen: "shareStack",
      params: {
        screen: "normalShare",
        params: {
          ciphers: selectedCiphers,
        },
      },
    })
    clearSelect()
  }, [navigation, selectedCiphers, user.isFreePlan, clearSelect])

  const navigateToDelete = useCallback(() => {
    navigation.navigate("cipherActionsModal", {
      mode: CipherActionsModal.DELETE,
      deleteIds: selectedCipherIds,
    })
  }, [navigation, selectedCipherIds])

  const navigateToCipherActions = useCallback(
    (item: CipherAppView) => {
      const data: CipherAppView = {
        ...item,
        revisionDate: null,
      }
      navigation.navigate("cipherActionsModal", {
        mode: CipherActionsModal.DEFAULT,
        item: data,
        deleteIds: [item.id],
      })
    },
    [navigation]
  )

  const onCloseSortModal = useCallback(() => {
    setIsSortOpen(false)
  }, [])

  const onOpenSortModal = useCallback(() => {
    setIsSortOpen(true)
  }, [])

  // ------------------------ EFFECT ----------------------------

  useFetchMarketingContent()
  useHomeBackHandler()

  useEffect(() => {
    const listener1 = EventBus.createListener(AppEventType.UNSELECT_ALL, () => {
      clearSelect()
    })

    return () => {
      EventBus.removeListener(listener1)
    }
  }, [clearSelect])
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
          clearSelect={clearSelect}
          selectedCount={selectedCipherIds.length}
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
        selectedCiphers={selectedCiphers}
        setSelectedCiphers={setSelectedCiphers}
        setAllItems={setAllItems}
        openActionsMenu={navigateToCipherActions}
        ListEmptyComponent={<HomeEmpty onAdd={navigateToAddCipher} onImport={navigateToImport} />}
      />
    </Screen>
  )
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})
