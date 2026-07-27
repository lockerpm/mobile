import { useState, FC, useCallback, useRef, useMemo, useEffect } from "react"
import { StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"

import {
  CipherList,
  CipherListHeader,
  SortActionConfigModal,
  SortConfigType,
} from "app/components/ciphers"
import { Screen } from "app/components/cores"
import { useStores } from "app/models"
import { BrowseScreenProps } from "app/navigators"
import { useCipherData } from "app/services/hook"
import { MAX_CIPHER_SELECTION } from "app/static/constants"
import { AccountRole, CipherActionsModal, CipherAppView } from "app/static/types"
import { CipherType } from "core/enums"

import { getTeam } from "@/utils/cipherHelper"
import { AppEventType, EventBus } from "@/utils/eventBus"

import { CipherListEmpty } from "./CipherListEmpty"

const allTypes = [
  CipherType.Card,
  CipherType.Login,
  CipherType.Identity,
  CipherType.CryptoWallet,
  CipherType.SecureNote,
]
/**
 * Render the Cipher List screen with target ciphertype
 */
export const CipherListScreen: FC<BrowseScreenProps<"cipherList">> = observer(
  ({
    navigation,
    route: {
      params: {
        cipherTypes = allTypes,
        header,
        headerTx,
        folderId,
        organizationId,
        collectionId,
        isDeleted = false,
      },
    },
  }) => {
    const { user, cipherStore, uiStore } = useStores()
    const { restoreCiphers } = useCipherData()

    const organizations = cipherStore.organizations
    // -------------- PARAMS ------------------
    const [isSortOpen, setIsSortOpen] = useState(false)
    const [sortConfig, setSortConfig] = useState<SortConfigType>(
      uiStore.sortConfig || {
        sort: {
          orderField: "revisionDate",
          order: "desc",
        },
        option: "last_updated",
      }
    )

    const allCipher = useRef<CipherAppView[]>([])
    const [isSelecting, setIsSelecting] = useState(false)
    const [selectedCiphers, setSelectedCiphers] = useState<CipherAppView[]>([])

    const selectedCipherIds = selectedCiphers.map((item) => item.id)

    const isCollectionAddable = useMemo(() => {
      if (!organizationId) {
        return true
      }
      const shareRole = getTeam(organizations, organizationId).type
      return shareRole === AccountRole.OWNER || shareRole === AccountRole.ADMIN
    }, [organizationId, organizations])

    // ------------------------ METHODS ------------------------

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

    const navigateToAddCipher = useCallback(() => {
      if (cipherTypes.length > 2) {
        navigation.navigate("addCipherModal", {
          folderId,
          collectionId,
        })
      } else if (cipherTypes.length === 1) {
        const initCollectionIds = collectionId ? [collectionId] : undefined
        navigation.navigate("cipherEdit", {
          mode: "add",
          cipherType: cipherTypes[0],
          initCollectionIds,
          initFolderId: folderId,
        })
      }
    }, [cipherTypes, navigation, folderId, collectionId])

    const navigateToFolder = useCallback(() => {
      navigation.navigate("folderSelect", {
        mode: "move",
        cipherIds: selectedCipherIds,
      })
    }, [navigation, selectedCipherIds])

    const clearSelect = useCallback(() => {
      setIsSelecting(false)
      setSelectedCiphers([])
    }, [])

    const navigateToShare = useCallback(() => {
      if (user.isFreePlan) {
        navigation.navigate("cipherActionsModal", {
          mode: CipherActionsModal.PREMIUM_ACTION,
          deleteIds: [],
        })
        return
      }
      navigation.navigate("shareStack", {
        screen: "normalShare",
        params: {
          ciphers: selectedCiphers.map((e) => ({ ...e, revisionDate: null })),
        },
      })
      clearSelect()
    }, [user.isFreePlan, navigation, selectedCiphers, clearSelect])

    const openDelete = useCallback(() => {
      navigation.navigate("cipherActionsModal", {
        mode: CipherActionsModal.DELETE,
        deleteIds: selectedCipherIds,
        isDeleted,
      })
    }, [navigation, selectedCipherIds, isDeleted])

    const navigateToCipherActions = useCallback(
      (item: CipherAppView) => {
        const data: CipherAppView = {
          ...item,
          revisionDate: null,
        }
        navigation.navigate("cipherActionsModal", {
          mode: CipherActionsModal.DEFAULT,
          isDeleted: isDeleted,
          item: data,
          deleteIds: [item.id],
        })
      },
      [navigation, isDeleted]
    )

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
    }, [clearSelect, restoreCiphers, selectedCipherIds])
    // -------------- RENDER ------------------

    useEffect(() => {
      const listener1 = EventBus.createListener(AppEventType.UNSELECT_ALL, () => {
        clearSelect()
      })

      return () => {
        EventBus.removeListener(listener1)
      }
    }, [clearSelect])

    return (
      <Screen
        safeAreaEdges={["top"]}
        header={
          <CipherListHeader
            isHideAddFunc={!isCollectionAddable || isDeleted}
            isTrash={isDeleted}
            header={header}
            headerTx={headerTx}
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
          isdeleted={isDeleted}
          folderId={folderId}
          organizationId={organizationId}
          collectionId={collectionId}
          cipherTypes={cipherTypes}
          sort={sortConfig.sort}
          isSelecting={isSelecting}
          setIsSelecting={setIsSelecting}
          selectedCiphers={selectedCiphers}
          setSelectedCiphers={setSelectedCiphers}
          setAllItems={setAllItems}
          openActionsMenu={navigateToCipherActions}
          ListEmptyComponent={
            <CipherListEmpty
              isDeleted={isDeleted}
              cipherTypes={cipherTypes}
              onAdd={navigateToAddCipher}
            />
          }
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
