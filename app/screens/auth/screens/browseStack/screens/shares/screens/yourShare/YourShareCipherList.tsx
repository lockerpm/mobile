import { useState, useEffect } from "react"
import { View, SectionList, StyleSheet, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { useCipherData } from "app/services/hook"
import { useStores } from "app/models"
import { CollectionView } from "core/models/view/collectionView"
import { AccountRole, AccountRoleText, CipherAppView, CipherShareType } from "app/static/types"
import { Organization } from "core/models/domain/organization"
import { CipherView } from "core/models/view"
import { CollectionItem, EmptyCipherList } from "app/components/ciphers"
import { getCipherLogo, getTeam } from "app/utils/cipherHelper"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { YourShareCipherItem } from "./YourShareCipherItem"
import { useAppLocale } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

type Props = {
  openAdd: () => void
  openCollectionAction: (collection: CollectionView) => void
  openCipherAction: (item: CipherAppView) => void
  openCollectionCiphers: (collectionId: string, orgId: string, name: string) => void
  openShowConfirmModal: (item: CipherShareType) => void
}

const SHARE_EMPTY = require("assets/images/emptyCipherList/share-empty-img.png")

export const YourShareCipherList = observer(
  ({
    openAdd,
    openCollectionAction,
    openCipherAction,
    openCollectionCiphers,
    openShowConfirmModal,
  }: Props) => {
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
    const sharesCollection = [...collectionStore.collections].filter((i) => {
      // Computed
      const shareRole = getTeam(organizations, i.organizationId).type
      const isOwner = shareRole === AccountRole.OWNER
      return isOwner
    })
    const sharesCiphers = ciphers.filter((c) => !c.collectionIds?.length)

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
      const res: CipherShareType[] = []

      // Add image + share info
      searchRes.forEach((c: CipherView) => {
        const data: CipherShareType = {
          ...c,
          imgLogo: getCipherLogo(c),
          notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
            c.id
          ),
          isDeleted: c.isDeleted,
          description: "",
          status: "",
        }

        // Display for each sharing member
        const share = _getShare(c.organizationId)
        if (share) {
          share.members.forEach((m) => {
            let shareType = ""
            switch (m.role) {
              case AccountRoleText.MEMBER:
                shareType = translate("shares:share_type.view")
                break
              case AccountRoleText.ADMIN:
                shareType = translate("shares:share_type.edit")
                break
            }

            data.description = `${translate("shares:shared_with")} ${m.full_name || m.email} - ${shareType}`
            data.status = m.status
            data.member = m

            res.push(data)
          })
          share.groups.forEach((group) => {
            let shareType = ""
            switch (group.role) {
              case AccountRoleText.MEMBER:
                shareType = translate("shares:share_type.view")
                break
              case AccountRoleText.ADMIN:
                shareType = translate("shares:share_type.edit")
                break
            }

            data.description = `${translate("shares:shared_with")} ${group.name} - ${shareType}`
            // data.status = m.status
            data.group = group

            res.push(data)
          })
        }
      })
      // Done
      setCiphers(res)
    }

    // ------------------------ EFFECTS ----------------------------

    useEffect(() => {
      loadData()
    }, [cipherStore.lastSync, cipherStore.lastCacheUpdate, cipherStore.myShares])

    // ------------------------ RENDER ----------------------------
    const DATA = [
      {
        type: 2,
        data: sharesCollection,
      },
      {
        type: 1,
        data: sharesCiphers,
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
              {section.type === 1 && (
                <YourShareCipherItem
                  item={item}
                  openAction={openCipherAction}
                  openConfirmModal={openShowConfirmModal}
                />
              )}
              {section.type === 2 && (
                <CollectionItem
                  item={item}
                  openAction={openCollectionAction}
                  openCollectionCipher={openCollectionCiphers}
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
