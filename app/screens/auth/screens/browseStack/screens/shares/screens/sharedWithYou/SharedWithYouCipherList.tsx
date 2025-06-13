/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react"
import { View, SectionList } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from "lodash/orderBy"

// import { CollectionListItem } from "../shareItems/FolderShareListItem"
import { FolderAction } from "../../../folders/FolderAction"
import { useCipherData, useCipherHelper, useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { CollectionView } from "core/models/view/collectionView"
import {
  AccountRole,
  AccountRoleText,
  CipherAppView,
  SharedWithYouType,
  SharingStatus,
} from "app/static/types"
import { Organization } from "core/models/domain/organization"
import { CipherView } from "core/models/view"
import { CipherType } from "core/enums"
import { MAX_CIPHER_SELECTION } from "app/static/constants"
import { Text } from "app/components/cores"
import { useAppLocale } from "app/services/context"
import { useToast } from "app/services/utils"
import { getTeam } from "app/utils/cipherHelper"
import { EmptyCipherList } from "app/components/newCiphers"
import { ShareWithYouItem } from "./ShareWithYouItem"

export interface CipherSharedListProps {
  /**
   * Sort configuration
   */
  sort?: {
    orderField: string
    order: "desc" | "asc"
  }
  /**
   * Set selecting mode
   */
  isSelecting: boolean
  setIsSelecting: (val: boolean) => void
  selectedIds: string[]
  setSelectedIds: (val: string[]) => void
  /**
   * Store all items IDs for selection all action in header
   */
  setAllItems: (val: string[]) => void
  /**
   * Open Item actions
   */
  openActionsMenu: (item: CipherAppView) => void
}

const SHARE_EMPTY = require("assets/images/emptyCipherList/share-empty-img.png")

export const SharedWithYouCipherList = observer((props: CipherSharedListProps) => {
  const {
    sort,
    isSelecting,
    setIsSelecting,
    selectedIds,
    setSelectedIds,
    setAllItems,
    openActionsMenu,
  } = props
  const { translate } = useAppLocale()
  const { notifyTx } = useToast()
  const { getCiphersFromCache } = useCipherData()
  const { cipherStore, collectionStore, user } = useStores()
  const { newCipher, getCipherInfo } = useCipherHelper()

  // ------------------------ PARAMS ----------------------------

  const [searchText, setSearchText] = useState<string>("")
  const [ciphers, setCiphers] = useState<SharedWithYouType[]>([])

  // ------------------------ COMPUTED ----------------------------

  const organizations = cipherStore.organizations

  const pendingCiphers = cipherStore.sharingInvitations.map((i) => {
    const cipher: SharedWithYouType = newCipher(i.cipher_type)
    const cipherInfo = getCipherInfo(cipher)

    cipher.isShared = true
    cipher.id = i.id
    cipher.organizationId = i.team.id
    cipher.name = `(${translate("shares.encrypted_content")})`
    cipher.imgLogo = cipherInfo.img
    cipher.isAccepted = i.status === SharingStatus.ACCEPTED
    let shareType = ""
    if (i.role === AccountRoleText.MEMBER) {
      // if (i.hide_passwords) {
      //   shareType = translate('shares.share_type.only_fill')
      // } else {
      //   shareType = translate('shares.share_type.view')
      // }
      shareType = translate("shares.share_type.view")
    }
    if (i.role === AccountRoleText.ADMIN) {
      shareType = translate("shares.share_type.edit")
    }
    cipher.description = `${i.team.name} - ${shareType}`
    return cipher
  })

  const allCiphers = !!searchText.trim() || isSelecting ? ciphers : [...pendingCiphers, ...ciphers]

  const sharedCollection = collectionStore.collections.filter((i) => {
    // Computed
    const teamRole = getTeam(user.teams, i.organizationId).role
    const shareRole = getTeam(organizations, i.organizationId).type
    const isMember =
      !i.organizationId ||
      (teamRole && teamRole !== AccountRoleText.OWNER) ||
      shareRole === AccountRole.ADMIN ||
      shareRole === AccountRole.MEMBER
    return isMember && i.name?.includes(searchText.toLowerCase())
  })

  // ------------------------ METHODS ----------------------------

  const _getOrg = (id: string) => {
    return organizations.find((o: Organization) => o.id === id)
  }

  // Get ciphers list
  const loadData = async () => {
    // onLoadingChange && onLoadingChange(true)

    // Filter
    const filters = [
      (c: CipherView) => {
        if (!c.organizationId) {
          return false
        }
        const org = _getOrg(c.organizationId)
        return (org && org.type !== 0) || false
      },
    ]

    // Search
    const searchRes = await getCiphersFromCache({
      filters,
      searchText,
      deleted: false,
    })

    // Add image + org info
    let res = searchRes.map((c: CipherView) => {
      const cipherInfo = getCipherInfo(c)
      const data = {
        ...c,
        imgLogo: cipherInfo.img,
        notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
          c.id,
        ),
      }
      return data
    })

    // Sort
    if (sort) {
      const { orderField, order } = sort
      res =
        orderBy(
          res,
          [(c) => (orderField === "name" ? c.name && c.name.toLowerCase() : c.revisionDate)],
          [order],
        ) || []
    }

    setCiphers(res)
    setAllItems(res.map((c) => c.id))
  }

  // Handle action menu open
  const openActionMenu = (item: CipherSharedType) => {
    // cipherStore.setSelectedCipher(item)
    // if (item.isShared) {
    // setShowPendingAction(true)
    // }
  }

  // Handle open collection menu
  const openCollectionActionMenu = (item: CollectionView) => {
    // setSelectedCollection(item)
    // setShowCollectionAction(true)
  }

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    if (!isSelecting) {
      setIsSelecting(true)
    }
    let selected = [...selectedIds]
    if (!selected.includes(id)) {
      if (selected.length === MAX_CIPHER_SELECTION) {
        notifyTx("error", "error.cannot_select_more", { count: MAX_CIPHER_SELECTION })
        return
      }
      selected.push(id)
    } else {
      selected = selected.filter((i) => i !== id)
    }
    setSelectedIds(selected)
  }

  // ------------------------ EFFECTS ----------------------------

  useEffect(() => {
    loadData()
  }, [
    searchText,
    cipherStore.lastSync,
    cipherStore.lastCacheUpdate,
    sort,
    cipherStore.notSynchedCiphers,
  ])

  const DATA = [
    {
      type: 2,
      data: [...sharedCollection],
    },
    {
      type: 1,
      data: [...allCiphers.filter((c) => !c.collectionIds?.length)],
    },
  ]
  // ------------------------ RENDER ----------------------------

  return (
    <View style={{ flex: 1 }}>
      {/* Action menus */}

      {/* <PendingSharedAction
        isOpen={showPendingAction}
        onClose={() => setShowPendingAction(false)}
        onLoadingChange={onLoadingChange}
      /> */}

      {/* <FolderAction
        isOpen={showCollectionAction}
        onClose={() => setShowCollectionAction(false)}
        onLoadingChange={onLoadingChange}
        folder={selectedCollection}
      /> */}

      <SectionList
        style={{
          paddingHorizontal: 20,
        }}
        sections={DATA || []}
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item, index, section }) => (
          <View>
            {section.type === 1 && (
              <ShareWithYouItem
                item={item}
                isSelecting={isSelecting}
                toggleItemSelection={toggleItemSelection}
                openActionMenu={openActionMenu}
                isSelected={selectedIds.includes(item.id)}
                org={_getOrg(item)}
              />
            )}
            {/* {section.type === 2 && (
              <CollectionListItem
                item={item}
                openActionMenu={openCollectionActionMenu}
                navigation={navigation}
              />
            )} */}
          </View>
        )}
        ListEmptyComponent={
          !searchText.trim() ? (
            <View style={{ paddingHorizontal: 20 }}>
              <EmptyCipherList
                image={SHARE_EMPTY}
                titleTx="shares.empty.title"
                descTx="shares.empty.desc_shared"
              />
            </View>
          ) : (
            <View style={{ paddingHorizontal: 20 }}>
              <Text
                preset="label"
                text={translate("error.no_results_found") + ` '${searchText}'`}
                style={{
                  textAlign: "center",
                }}
              />
            </View>
          )
        }
      />
    </View>
  )
})
