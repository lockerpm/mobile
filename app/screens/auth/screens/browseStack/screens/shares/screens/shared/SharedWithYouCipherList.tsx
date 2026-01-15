import { useState, useEffect } from "react"
import { View, SectionList, StyleSheet, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

import { CollectionItem, EmptyCipherList } from "app/components/ciphers"
import { useStores } from "app/models"
import { useCipherData, useCipherHelper } from "app/services/hook"
import { AccountRole, AccountRoleText, SharedWithYouType, SharingStatus } from "app/static/types"
import { getCipherLogo, getTeam } from "app/utils/cipherHelper"
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

export const SharedWithYouCipherList = observer(
  ({ openCipherActions, openFolderActions, openCollectionCiphers }: CipherSharedListProps) => {
    const { themed } = useAppTheme()
    const { translate } = useAppLocale()
    const { getCiphersFromCache } = useCipherData()
    const { cipherStore, collectionStore, user } = useStores()
    const { newCipher } = useCipherHelper()

    // ------------------------ PARAMS ----------------------------

    const [ciphers, setCiphers] = useState<SharedWithYouType[]>([])

    // ------------------------ COMPUTED ----------------------------

    const organizations = [...cipherStore.organizations]
    const pendingCiphers = cipherStore.sharingInvitations.map((i) => {
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
      return data
    })

    const allCiphers = [...pendingCiphers, ...ciphers]

    const sharedCollection = collectionStore.collections.filter((i) => {
      // Computed
      const teamRole = getTeam(user.teams, i.organizationId).role
      const shareRole = getTeam(organizations, i.organizationId).type
      const isMember =
        !i.organizationId ||
        (teamRole && teamRole !== AccountRoleText.OWNER) ||
        shareRole === AccountRole.ADMIN ||
        shareRole === AccountRole.MEMBER
      return isMember
    })

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
      const res = searchRes.map((c: CipherView) => {
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
        return data
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
      organizations,
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
      <View style={styles.flex}>
        <SectionList
          contentContainerStyle={styles.content}
          sections={DATA}
          keyExtractor={(item, index) => String(index)}
          renderItem={({ item, section }) => (
            <View>
              {section.type === 1 && (
                <ShareWithYouItem
                  item={item}
                  openActionMenu={openCipherActions}
                  // @ts-ignore
                  org={getOrg(item)}
                />
              )}
              {section.type === 2 && (
                <CollectionItem
                  isYourSharedScreen
                  item={item}
                  openCollectionCipher={openCollectionCiphers}
                  openAction={openFolderActions}
                />
              )}
            </View>
          )}
          SectionSeparatorComponent={() => <View style={themed($divider)} />}
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
