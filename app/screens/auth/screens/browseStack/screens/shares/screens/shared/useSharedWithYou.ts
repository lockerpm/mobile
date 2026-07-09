import { useEffect, useState } from "react"

import { useStores } from "app/models"
import { useCipherData, useCipherHelper } from "app/services/hook"
import { AccountRole, AccountRoleText, SharedWithYouType, SharingStatus } from "app/static/types"
import { getCipherLogo, getTeam } from "app/utils/cipherHelper"
import { OrganizationUserType } from "core/enums/organizationUserType"
import { Organization } from "core/models/domain/organization"
import { CipherView } from "core/models/view"

import { useAppLocale } from "@/i18n"

export type CipherItemType = {
  type: "cipher"
  data: SharedWithYouType
  acceptedTime: number
  org?: { type: AccountRole; name: string }
}

export type FolderItemType = {
  type: "folder"
  data: any
  isMember: boolean
  acceptedTime: number
}

export type SharedSortConfig = {
  orderField: "acceptedTime" | "name"
  order: "asc" | "desc"
  option: string
}

export const DEFAULT_SHARED_SORT: SharedSortConfig = {
  orderField: "acceptedTime",
  order: "desc",
  option: "accepted_time",
}

// Sort items/folders by the selected config. Both wrap their name at `item.data.name`.
const sortByConfig = <T extends { acceptedTime: number; data: { name?: string } }>(
  items: T[],
  config: SharedSortConfig
) =>
  [...items].sort((a, b) => {
    if (config.orderField === "name") {
      const cmp = (a.data.name ?? "").localeCompare(b.data.name ?? "")
      return config.order === "asc" ? cmp : -cmp
    }
    const cmp = a.acceptedTime - b.acceptedTime
    return config.order === "asc" ? cmp : -cmp
  })

// Map organization role -> account role for the share-type description.
// Enums are numerically aligned (Admin = 1, User/Member = 2); mirror the pending logic:
// member -> view, everything else -> edit.
const toAccountRole = (type: OrganizationUserType): AccountRole =>
  type === OrganizationUserType.User ? AccountRole.MEMBER : AccountRole.ADMIN

/**
 * Single source of truth for the "Shared with me" screen.
 * Holds the async cipher cache load + derives the two sorted tab lists so that
 * the container (counts) and the tab scenes (lists) always stay consistent.
 */
export const useSharedWithYou = () => {
  const { translate } = useAppLocale()
  const { getCiphersFromCache } = useCipherData()
  const { cipherStore, collectionStore } = useStores()
  const { newCipher } = useCipherHelper()

  const [ciphers, setCiphers] = useState<CipherItemType[]>([])
  const [sortConfig, setSortConfig] = useState<SharedSortConfig>(DEFAULT_SHARED_SORT)

  // ------------------------ COMPUTED ----------------------------

  const organizations = [...cipherStore.organizations]

  const getOrg = (id: string) => organizations.find((o: Organization) => o.id === id)

  const pendingCiphers: CipherItemType[] = cipherStore.sharingInvitations.map((i) => {
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

  const sharedCollection: FolderItemType[] = collectionStore.collections
    .map((i) => {
      const org = getTeam(organizations, i.organizationId)
      // getTeam returns a sentinel (no `id`) when the org is not found
      if (!org.id) {
        return {
          type: "folder",
          data: i,
          isMember: false,
          acceptedTime: 0,
        } as FolderItemType
      }
      const isMember = !i.organizationId || org.type === 1 || org.type === 2
      return {
        type: "folder",
        data: i,
        isMember,
        acceptedTime: org.acceptedTime,
      } as FolderItemType
    })
    .filter((e) => e.isMember)

  // Sort each tab independently by the selected sort config
  const sharedItemsData = sortByConfig(allCiphers, sortConfig)
  const collectionData = sortByConfig(sharedCollection, sortConfig)

  // ------------------------ METHODS ----------------------------

  const loadData = async () => {
    const filters = [
      (c: CipherView) => {
        if (!c.organizationId) {
          return false
        }
        const org = getOrg(c.organizationId)
        return (org && org.type !== 0) || false
      },
    ]

    const searchRes = await getCiphersFromCache({
      filters,
      searchText: "",
      deleted: false,
    })

    const res: CipherItemType[] = searchRes.map((c: CipherView) => {
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
        org: org ? { type: toAccountRole(org.type), name: org.name } : undefined,
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

  return { sharedItemsData, collectionData, sortConfig, setSortConfig }
}
