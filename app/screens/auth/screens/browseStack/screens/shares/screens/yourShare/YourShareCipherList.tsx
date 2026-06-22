import { useState, useEffect } from "react"
import { View, SectionList, StyleSheet, ViewStyle } from "react-native"
import orderBy from "lodash/orderBy"
import { observer } from "mobx-react-lite"
import { TOptions } from "node_modules/i18next/typescript/options"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

import { EmptyCipherList } from "app/components/ciphers"
import { useStores } from "app/models"
import { useCipherData } from "app/services/hook"
import {
  AccountRole,
  CipherAppView,
  CipherShareType,
  ConfirmShareItemInfo,
  FolderShareType,
  SharedMemberType,
} from "app/static/types"
import { getCipherLogo, getTeam } from "app/utils/cipherHelper"
import { Organization } from "core/models/domain/organization"
import { CipherView } from "core/models/view"
import { CollectionView } from "core/models/view/collectionView"

import { TxKeyPath, useAppLocale } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

import { YourShareCipherItem } from "./YourShareCipherItem"
import { YourShareCollectionItem } from "./YourShareCollectionItem"

type Props = {
  openAdd: () => void
  openCollectionAction: (collection: CollectionView) => void
  openCipherAction: (item: CipherAppView) => void
  openCollectionCiphers: (collectionId: string, orgId: string, name: string) => void
  openShowConfirmModal: (
    item: ConfirmShareItemInfo,
    members: SharedMemberType[],
    organizationId: string
  ) => void
}

enum SectionType {
  CIPHER = 1,
  COLLECTION = 2,
}

const SHARE_EMPTY = require("assets/images/emptyCipherList/share-empty-img.png")

export const YourShareCipherList = observer(
  ({ openAdd, openCollectionAction, openCipherAction, openShowConfirmModal }: Props) => {
    const { themed } = useAppTheme()
    const { translate } = useAppLocale()
    const { getCiphersFromCache } = useCipherData()
    const { cipherStore, collectionStore, user } = useStores()

    const isFreeAccount = user.isFreePlan

    // ------------------------ PARAMS ----------------------------
    const [ciphers, setCiphers] = useState<CipherShareType[]>([])

    // ------------------------ COMPUTED ----------------------------

    const organizations = [...cipherStore.organizations]
    const myShares = [...cipherStore.myShares]
    const _getOrg = (id: string) => {
      return organizations.find((o: Organization) => o.id === id)
    }

    const _getShare = (id: string) => {
      return myShares.find((s) => s.id === id)
    }

    const sharesCollection: FolderShareType[] = [...collectionStore.collections]
      .filter((i) => {
        // Computed
        const shareRole = getTeam(organizations, i.organizationId).type
        const isOwner = shareRole === AccountRole.OWNER
        return isOwner
      })
      .map((i) => {
        // Display for each sharing member
        const share = _getShare(i.organizationId)
        return {
          collection: i,
          description: "",
          members: share?.members || [],
          groups: share?.groups || [],
        }
      })
    const sharesCiphers = ciphers
      .filter((c) => !c.collectionIds?.length)
      .sort((a, b) => b.revisionDate!.getTime() - a.revisionDate!.getTime())

    // ------------------------ METHODS ----------------------------

    // Get ciphers list
    const loadData = async () => {
      // Filter
      const filters = [
        (c: CipherView) => {
          if (!c.organizationId) {
            return false
          }
          const share = _getShare(c.organizationId)
          const org = _getOrg(c.organizationId)
          return (
            (org &&
              org.type === 0 &&
              share &&
              (share.members.length > 0 || share.groups.length > 0)) ||
            false
          )
        },
      ]

      // Search
      const searchRes = await getCiphersFromCache({
        filters,
        searchText: "",
        deleted: false,
      })
      let res: CipherShareType[] = []
      // Add image + share info
      searchRes.forEach((c: CipherView) => {
        const data: CipherShareType = {
          ...c,
          imgLogo: getCipherLogo(c),
          notSync: false,
          isDeleted: c.isDeleted,
          description: "",
        }
        // Display for each sharing member
        const share = _getShare(c.organizationId)

        if (share) {
          const gl = share.groups.length
          data.description = getShareDescription(translate, share.members, gl)
          data.members = share.members
          data.groups = share.groups
        }
        res.push(data)
      })

      res = orderBy(res, [(c: CipherShareType) => c.revisionDate], []) || []
      // Done
      setCiphers(res)
    }

    // ------------------------ EFFECTS ----------------------------

    useEffect(() => {
      loadData()
    }, [
      cipherStore.lastSync,
      cipherStore.lastCacheUpdate,
      cipherStore.myShares,
      cipherStore.organizations,
    ])

    // ------------------------ RENDER ----------------------------
    const DATA = [
      {
        type: SectionType.CIPHER,
        data: sharesCiphers,
      },
      {
        type: SectionType.COLLECTION,
        data: sharesCollection,
      },
    ]

    return (
      <View style={styles.flex}>
        <SectionList
          contentContainerStyle={styles.container}
          sections={sharesCollection.length + ciphers.length > 0 ? DATA : []}
          keyExtractor={(_, index) => String(index)}
          renderItem={({ item, section }) => (
            <View>
              {section.type === SectionType.CIPHER && (
                <YourShareCipherItem
                  item={item}
                  openAction={openCipherAction}
                  openConfirmModal={openShowConfirmModal}
                />
              )}
              {section.type === SectionType.COLLECTION && (
                <YourShareCollectionItem
                  item={item}
                  openAction={openCollectionAction}
                  openConfirmModal={openShowConfirmModal}
                />
              )}
            </View>
          )}
          SectionSeparatorComponent={() => <View style={themed($divider)} />}
          ItemSeparatorComponent={() => <View style={themed($divider)} />}
          ListEmptyComponent={
            <EmptyCipherList
              image={SHARE_EMPTY}
              titleTx={"shares:empty.title"}
              descTx={isFreeAccount ? "error:not_available_for_free" : "shares:empty.desc_share"}
              buttonTx={isFreeAccount ? "common:upgrade" : "shares:start_sharing"}
              addItem={openAdd}
            />
          }
        />
      </View>
    )
  }
)

const getShareDescription = (
  translate: (tx: TxKeyPath, options?: TOptions | undefined) => string,
  members: SharedMemberType[],
  gl: number
) => {
  const ml = members.length
  if (ml > 0 && gl > 0) {
    return (
      translate("shares:shared_with") +
      ` ${ml} ` +
      translate(ml > 1 ? "shares:users" : "shares:user") +
      ` - ${gl} ` +
      translate(gl > 1 ? "shares:groups" : "shares:group")
    )
  } else if (ml > 0) {
    if (ml === 1) {
      return translate("shares:shared_with") + ` ${members[0].email} `
    }
    return (
      translate("shares:shared_with") +
      ` ${ml} ` +
      translate(ml > 1 ? "shares:users" : "shares:user")
    )
  } else if (gl > 0) {
    return (
      translate("shares:shared_with") +
      ` ${gl} ` +
      translate(gl > 1 ? "shares:groups" : "shares:group")
    )
  }
  return ""
}

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.border,
})

const styles = StyleSheet.create({
  container: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom + 8,
    paddingHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
})
