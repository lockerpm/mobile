/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from "react"
import { View, SectionList, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from "lodash/orderBy"
// import { ShareItemAction } from "./ShareItemAction"
// import { FolderAction } from "../../../folders/FolderAction"
// import { CollectionListItem } from "./FolderShareListItem"
// import { ConfirmShareModal } from "./ConfirmShareModal"
import { Text } from "app/components/cores"
import { useCipherData, useCipherHelper, useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { CollectionView } from "core/models/view/collectionView"
import {
  AccountRole,
  AccountRoleText,
  CipherAppView,
  CipherShareType,
  SharedGroupType,
  SharedMemberType,
} from "app/static/types"
import { Organization } from "core/models/domain/organization"
import { CipherView } from "core/models/view"
import { useAppLocale } from "app/services/context"
import { EmptyCipherList, ShareCipherItem, ShareFolderItem } from "app/components/newCiphers"
import { useNavigation } from "@react-navigation/native"
import { ShareStackScreenProps } from "app/navigators"
import { getCipherLogo, getTeam } from "app/utils/cipherHelper"

type Props = {
  openAdd: () => void
  sort: {
    orderField: string
    order: "desc" | "asc"
  }
}

const SHARE_EMPTY = require("assets/images/emptyCipherList/share-empty-img.png")

export const CipherShareList = observer(({ sort, openAdd }: Props) => {
  const navigation = useNavigation<ShareStackScreenProps<"yourShare">["navigation"]>()
  const { getCiphersFromCache } = useCipherData()
  const { translate } = useAppLocale()
  const { cipherStore, collectionStore, user } = useStores()

  const isFreeAccount = user.isFreePlan

  // ------------------------ PARAMS ----------------------------
  const [searchText, setSearchText] = useState<string>("")
  const [ciphers, setCiphers] = useState<CipherShareType[]>([])

  // ------------------------ COMPUTED ----------------------------

  const organizations = [...cipherStore.organizations]
  const myShares = [...cipherStore.myShares]
  const sharesCollection = [...collectionStore.collections].filter((i) => {
    // Computed
    const shareRole = getTeam(organizations, i.organizationId).type
    const isOwner = shareRole === AccountRole.OWNER
    return isOwner && i.name.includes(searchText.toLowerCase())
  })

  const DATA = [
    {
      type: 2,
      data: sharesCollection,
    },
    {
      type: 1,
      data: ciphers,
    },
  ]

  // ------------------------ METHODS ----------------------------

  const _getOrg = (id: string) => {
    return organizations.find((o: Organization) => o.id === id)
  }

  const _getShare = (id: string) => {
    return myShares.find((s) => s.id === id)
  }

  // Get ciphers list
  const loadData = async () => {
    // Filter
    const filters = [
      (c: CipherView) => {
        if (!c.organizationId) {
          return false
        }

        if (!c.collectionIds?.length) {
          const share = _getShare(c.organizationId)
          const org = _getOrg(c.organizationId)
          return (
            (org &&
              org.type === 0 &&
              share &&
              (share.members.length > 0 || share.groups.length > 0)) ||
            false
          )
        }
        return false
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
      const data: CipherAppView = {
        ...c,
        imgLogo: getCipherLogo(c),
        notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
          c.id,
        ),
        isDeleted: c.isDeleted,
      }
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

    // Done
    setCiphers(res)
  }

  // Handle action menu open
  const openCipherAction = (item: CipherShareType) => {
    // cipherStore.setSelectedCipher(item)
    // if (item.member) {
    //   setSelectedMember(item.member)
    // }
    // if (item.group) {
    //   setSelectedGroup(item.group)
    // }
    // setShowAction(true)
  }
  // Handle action menu open
  const openShowConfirmModal = (item: CipherShareType) => {
    // cipherStore.setSelectedCipher(item)
    // if (item.member) {
    //   setSelectedMember(item.member)
    // }
    // if (item.group) {
    //   setSelectedGroup(item.group)
    // }
    // setShowConfirmModal(true)
  }

  const openCollectionAction = () => {
    // setSelectedCollection(item)
    // setShowCollectionAction(true)
  }

  const navigateToCollectionCiphers = useCallback((collectionId: string, orgId: string) => {
    navigation.navigate("cipherList", {
      collectionId,
      organizationId: orgId,
    })
  }, [])

  // Go to detail
  const goToDetail = (item: CipherShareType) => {
    // cipherStore.setSelectedCipher(item)
    // const cipherInfo = getCipherInfo(item)
    // navigation.navigate(`${cipherInfo.path}__info`)
  }

  // ------------------------ EFFECTS ----------------------------

  useEffect(() => {
    loadData()
  }, [searchText, cipherStore.lastSync, cipherStore.lastCacheUpdate, sort, cipherStore.myShares])

  // ------------------------ RENDER ----------------------------

  return (
    <View style={styles.flex}>
      <SectionList
        contentContainerStyle={styles.container}
        sections={sharesCollection.length + ciphers.length > 0 ? DATA : []}
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item, index, section }) => (
          <View>
            {section.type === 1 && (
              <ShareCipherItem
                item={item}
                openAction={openCipherAction}
                openConfirmModal={openShowConfirmModal}
              />
            )}
            {section.type === 2 && (
              <ShareFolderItem
                item={item}
                openAction={openCollectionAction}
                openFolderCipher={navigateToCollectionCiphers}
              />
            )}
          </View>
        )}
        ListEmptyComponent={
          !searchText.trim() ? (
            <View style={{ paddingHorizontal: 20, flex: 1 }}>
              <EmptyCipherList
                image={SHARE_EMPTY}
                titleTx={"shares.empty.title"}
                descTx={isFreeAccount ? "error.not_available_for_free" : "shares.empty.desc_share"}
                buttonTx={isFreeAccount ? "common.upgrade" : "shares.start_sharing"}
                addItem={openAdd}
              />
            </View>
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
})
