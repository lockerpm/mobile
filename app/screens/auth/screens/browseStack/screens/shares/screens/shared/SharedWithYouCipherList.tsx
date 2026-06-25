import { useState, useEffect } from "react"
import { View, StyleSheet, ViewStyle, FlatList } from "react-native"
import find from "lodash/find"
import { observer } from "mobx-react-lite"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

import { CollectionItem, EmptyCipherList } from "app/components/ciphers"
import { useStores } from "app/models"
import { useCipherData, useCipherHelper } from "app/services/hook"
import { AccountRoleText, SharedWithYouType, SharingStatus } from "app/static/types"
import { getCipherLogo } from "app/utils/cipherHelper"
import { Organization } from "core/models/domain/organization"
import { CipherView } from "core/models/view"
import { CollectionView } from "core/models/view/collectionView"

import { useAppLocale } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

import { ShareWithYouItem } from "./ShareWithYouItem"

export interface CipherSharedListProps {
  openCipherActions: (item: SharedWithYouType) => void
  openFolderActions: (item: CollectionView) => void
  openCollectionCiphers: (collectionId: string, orgId: string, name: string) => void
}

const SHARE_EMPTY = require("assets/images/emptyCipherList/share-empty-img.png")

type ItemType =
  | {
      type: "cipher"
      data: SharedWithYouType
      acceptedTime: number
    }
  | {
      type: "folder"
      data: any
      isMember: boolean
      acceptedTime: number
    }

export const SharedWithYouCipherList = observer(
  ({ openCipherActions, openFolderActions, openCollectionCiphers }: CipherSharedListProps) => {
    const { themed } = useAppTheme()
    const { translate } = useAppLocale()
    const { getCiphersFromCache } = useCipherData()
    const { cipherStore, collectionStore } = useStores()
    const { newCipher } = useCipherHelper()

    // ------------------------ PARAMS ----------------------------

    const [ciphers, setCiphers] = useState<ItemType[]>([])

    // ------------------------ COMPUTED ----------------------------

    const organizations = [...cipherStore.organizations]
    const pendingCiphers: ItemType[] = cipherStore.sharingInvitations.map((i) => {
      const cipherView = newCipher(i.cipher_type)
      const cipherLogo = getCipherLogo(cipherView)
      const shareType =
        i.role === AccountRoleText.MEMBER
          ? translate("shares:share_type.view")
          : translate("shares:share_type.edit")
      const data: SharedWithYouType = {
        ...cipherView,
        imgLogo: cipherLogo,
        notSync: false,
        isDeleted: cipherView.isDeleted,
        isShared: true,
        id: i.id,
        organizationId: i.team.id,
        name: `(${translate("shares:encrypted_content")})`,
        isAccepted: i.status === SharingStatus.ACCEPTED,
        description: `${i.team.name} - ${shareType}`,
      }
      return {
        type: "cipher",
        data,
        acceptedTime: 9999999999,
      }
    })

    const allCiphers = [...pendingCiphers, ...ciphers].filter((c) => !c.data.collectionIds?.length)

    const sharedCollection: ItemType[] = collectionStore.collections
      .map((i) => {
        // Computed
        const org = getTeam(organizations, i.organizationId)
        if (!org) {
          return {
            type: "folder",
            data: i,
            isMember: false,
            acceptedTime: 0,
          } as ItemType
        }
        const isMember = !i.organizationId || org.type === 1 || org.type === 2
        return {
          type: "folder",
          data: i,
          isMember,
          acceptedTime: org.acceptedTime,
        } as ItemType
      })
      .filter((e) => e.type === "folder" && e.isMember)

    const data = [...allCiphers, ...sharedCollection].sort(
      (a, b) => b.acceptedTime - a.acceptedTime
    )

    // ------------------------ METHODS ----------------------------

    const getOrg = (id: string) => {
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
          const org = getOrg(c.organizationId)
          return (org && org.type !== 0) || false
        },
      ]

      // Search
      const searchRes = await getCiphersFromCache({
        filters,
        searchText: "",
        deleted: false,
      })

      // Add image + org info
      const res: ItemType[] = searchRes.map((c: CipherView) => {
        const org = getOrg(c.organizationId)
        const cipherLogo = getCipherLogo(c)
        const data: SharedWithYouType = {
          ...c,
          imgLogo: cipherLogo,
          isDeleted: c.isDeleted,
          notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
            c.id
          ),
          isShared: false,
          description: "",
          isAccepted: false,
        }
        return {
          type: "cipher",
          acceptedTime: org?.acceptedTime || 0,
          data,
        }
      })

      setCiphers(res)
    }

    // ------------------------ EFFECTS ----------------------------

    useEffect(() => {
      loadData()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      cipherStore.lastSync,
      cipherStore.lastCacheUpdate,
      cipherStore.notSynchedCiphers,
      cipherStore.organizations,
    ])

    // ------------------------ RENDER ----------------------------

    return (
      <View style={styles.flex}>
        <FlatList
          contentContainerStyle={styles.content}
          data={data}
          keyExtractor={(item, index) => String(index)}
          renderItem={({ item }) => (
            <View>
              {item.type === "cipher" && (
                <ShareWithYouItem
                  item={item.data}
                  openActionMenu={openCipherActions}
                  // @ts-ignore
                  org={getOrg(item)}
                />
              )}
              {item.type === "folder" && (
                <CollectionItem
                  isYourSharedScreen
                  item={item.data}
                  openCollectionCipher={openCollectionCiphers}
                  openAction={openFolderActions}
                />
              )}
            </View>
          )}
          ItemSeparatorComponent={() => <View style={themed($divider)} />}
          ListEmptyComponent={
            <EmptyCipherList
              image={SHARE_EMPTY}
              titleTx="shares:empty.title"
              descTx="shares:empty.desc_shared"
            />
          }
        />
      </View>
    )
  }
)

// Get team
export const getTeam = (teams: Organization[], orgId: string | null) => {
  return find(teams, (e) => e.id === orgId)
}

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.border,
})

const styles = StyleSheet.create({
  content: {
    paddingBottom: 8 + StaticSafeAreaInsets.safeAreaInsetsBottom,
    paddingHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
})
