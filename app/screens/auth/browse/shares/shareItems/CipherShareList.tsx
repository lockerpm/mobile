/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react"
import { View, SectionList } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from "lodash/orderBy"
import { ShareItemAction } from "./ShareItemAction"
import { CipherShareListItem, CipherShareType } from "./CipherShareListItem"
import { FolderAction } from "../../folders/FolderAction"
import { CollectionListItem } from "./FolderShareListItem"
import { ConfirmShareModal } from "./ConfirmShareModal"
import { Text } from "app/components/cores"
import { useCipherData, useCipherHelper, useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { CollectionView } from "core/models/view/collectionView"
import { AccountRole, AccountRoleText, SharedGroupType, SharedMemberType } from "app/static/types"
import { Organization } from "core/models/domain/organization"
import { CipherView } from "core/models/view"

type Props = {
  emptyContent?: JSX.Element
  navigation: any
  searchText?: string
  onLoadingChange?: (val: boolean) => void
  sortList?: {
    orderField: string
    order: string
  }
}

/**
 * Describe your component here
 */
export const CipherShareList = observer((props: Props) => {
  const { emptyContent, navigation, onLoadingChange, searchText, sortList } = props
  const { getCiphersFromCache } = useCipherData()
  const { getCipherInfo } = useCipherHelper()
  const { translate, getTeam } = useHelper()
  const { cipherStore, collectionStore } = useStores()

  // ------------------------ PARAMS ----------------------------

  const [ciphers, setCiphers] = useState<CipherShareType[]>([])
  const [showAction, setShowAction] = useState(false)
  const [showCollectionAction, setShowCollectionAction] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<CollectionView>(null)
  const [selectedMember, setSelectedMember] = useState<SharedMemberType>(null)
  const [selectedGroup, setSelectedGroup] = useState<SharedGroupType>(null)

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  // ------------------------ COMPUTED ----------------------------

  const organizations = cipherStore.organizations
  const myShares = cipherStore.myShares

  // ------------------------ EFFECTS ----------------------------

  useEffect(() => {
    loadData()
  }, [
    searchText,
    cipherStore.lastSync,
    cipherStore.lastCacheUpdate,
    sortList,
    JSON.stringify(cipherStore.myShares),
  ])

  // ------------------------ METHODS ----------------------------

  const _getOrg = (id: string) => {
    return organizations.find((o: Organization) => o.id === id)
  }

  const _getShare = (id: string) => {
    return myShares.find((s) => s.id === id)
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

        // // TODO
        // if (collections.some(e => c.collectionIds.includes(e.id))) {
        //   return false
        // }

        const share = _getShare(c.organizationId)
        const org = _getOrg(c.organizationId)
        return (
          org && org.type === 0 && share && (share.members.length > 0 || share.groups.length > 0)
        )
      },
    ]

    // Search
    const searchRes = await getCiphersFromCache({
      filters,
      searchText,
      deleted: false,
    })
    let res: CipherShareType[] = []

    // Add image + share info
    searchRes.forEach((c: CipherView) => {
      const cipherInfo = getCipherInfo(c)

      // @ts-ignore
      const data: CipherShareType = {
        ...c,
        imgLogo: cipherInfo.img,
        notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
          c.id,
        ),
        description: "",
        status: null,
      }

      // Display for each sharing member
      const share = _getShare(c.organizationId)
      share.members.forEach((m) => {
        let shareType = ""
        switch (m.role) {
          case AccountRoleText.MEMBER:
            // shareType = !m.hide_passwords ? translate('shares.share_type.view') : translate('shares.share_type.only_fill')
            shareType = translate("shares.share_type.view")
            break
          case AccountRoleText.ADMIN:
            shareType = translate("shares.share_type.edit")
            break
        }

        data.description = `${translate("shares.shared_with")} ${m.full_name} - ${shareType}`
        data.status = m.status
        data.member = m

        // @ts-ignore
        res.push({ ...data })
      })

      share.groups.forEach((group) => {
        let shareType = ""
        switch (group.role) {
          case AccountRoleText.MEMBER:
            // shareType = !m.hide_passwords ? translate('shares.share_type.view') : translate('shares.share_type.only_fill')
            shareType = translate("shares.share_type.view")
            break
          case AccountRoleText.ADMIN:
            shareType = translate("shares.share_type.edit")
            break
        }

        data.description = `${translate("shares.shared_with")} ${group.name} - ${shareType}`
        // data.status = m.status
        data.group = group

        // @ts-ignore
        res.push({ ...data })
      })
    })

    // Sort
    if (sortList) {
      const { orderField, order } = sortList
      res =
        orderBy(
          res,
          [(c) => (orderField === "name" ? c.name && c.name.toLowerCase() : c.revisionDate)],
          [order],
        ) || []
    }

    // Delay loading
    setTimeout(() => {
      onLoadingChange && onLoadingChange(false)
    }, 100)

    // Done
    setCiphers(res)
  }

  // Handle action menu open
  const openCipherActionMenu = (item: CipherShareType) => {
    cipherStore.setSelectedCipher(item)
    if (item.member) {
      setSelectedMember(item.member)
    }
    if (item.group) {
      setSelectedGroup(item.group)
    }
    setShowAction(true)
  }
  // Handle action menu open
  const openShowConfirmModal = (item: CipherShareType) => {
    cipherStore.setSelectedCipher(item)
    if (item.member) {
      setSelectedMember(item.member)
    }
    if (item.group) {
      setSelectedGroup(item.group)
    }
    setShowConfirmModal(true)
  }

  const openCollectionActionMenu = (item: CollectionView) => {
    setSelectedCollection(item)
    setShowCollectionAction(true)
  }

  // Go to detail
  const goToDetail = (item: CipherShareType) => {
    cipherStore.setSelectedCipher(item)
    const cipherInfo = getCipherInfo(item)
    navigation.navigate(`${cipherInfo.path}__info`)
  }

  const sharesCollection = collectionStore.collections.filter((i) => {
    // Computed
    const shareRole = getTeam(organizations, i.organizationId).type
    const isOwner = shareRole === AccountRole.OWNER
    return isOwner && i.name?.includes(searchText.toLowerCase())
  })

  const sharesCiphers = ciphers.filter((c) => !c.collectionIds?.length)

  const DATA = [
    {
      type: 2,
      data: [...sharesCollection],
    },
    {
      type: 1,
      data: [...sharesCiphers],
    },
  ]

  // ------------------------ RENDER ----------------------------

  return (
    <View style={{ flex: 1 }}>
      {/* Action menus */}

      <ConfirmShareModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        member={selectedMember}
      />

      <ShareItemAction
        isOpen={showAction}
        onClose={() => setShowAction(false)}
        onLoadingChange={onLoadingChange}
        member={selectedMember}
        group={selectedGroup}
        goToDetail={goToDetail}
      />

      <FolderAction
        isOpen={showCollectionAction}
        onClose={() => setShowCollectionAction(false)}
        onLoadingChange={onLoadingChange}
        folder={selectedCollection}
      />

      {/* Action menus end */}
      <SectionList
        style={{
          paddingHorizontal: 20,
        }}
        sections={sharesCollection?.length + sharesCiphers?.length > 0 ? DATA : []}
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item, index, section }) => (
          <View>
            {section.type === 1 && (
              <CipherShareListItem
                item={item}
                openActionMenu={openCipherActionMenu}
                setShowConfirmModal={openShowConfirmModal}
              />
            )}
            {section.type === 2 && (
              <CollectionListItem
                item={item}
                openActionMenu={openCollectionActionMenu}
                navigation={navigation}
              />
            )}
          </View>
        )}
        ListEmptyComponent={
          emptyContent && !searchText.trim() ? (
            <View style={{ paddingHorizontal: 20, flex: 1 }}>{emptyContent}</View>
          ) : (
            <View style={{ paddingHorizontal: 20 }}>
              <Text
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
