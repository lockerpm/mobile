import { useEffect, useState } from "react"

import { useStores } from "app/models"
import { useCipherData } from "app/services/hook"
import { AccountRole, CipherShareType, FolderShareType, SharedMemberType } from "app/static/types"
import { getCipherLogo, getTeam } from "app/utils/cipherHelper"
import { Organization } from "core/models/domain/organization"
import { CipherView } from "core/models/view"

import { useAppLocale } from "@/i18n"

export type YourShareSortConfig = {
  orderField: "revisionDate" | "name"
  order: "asc" | "desc"
  option: string
}

export const DEFAULT_YOUR_SHARE_SORT: YourShareSortConfig = {
  orderField: "revisionDate",
  order: "desc",
  option: "last_updated",
}

// Sort by name (a-z) or by an update time. Selectors adapt to each shape:
// ciphers keep name/revisionDate at top level, collections nest them under `collection`
// (and collections have no revisionDate, so their time selector is a no-op).
const sortByConfig = <T>(
  items: T[],
  config: YourShareSortConfig,
  getName: (item: T) => string,
  getTime: (item: T) => number
) =>
  [...items].sort((a, b) => {
    if (config.orderField === "name") {
      const cmp = getName(a).localeCompare(getName(b))
      return config.order === "asc" ? cmp : -cmp
    }
    const cmp = getTime(a) - getTime(b)
    return config.order === "asc" ? cmp : -cmp
  })

/**
 * Single source of truth for the "Your shares" screen: loads the shared ciphers,
 * derives the owned shared collections, and returns the two sorted tab lists.
 */
export const useYourShare = () => {
  const { translate } = useAppLocale()
  const { getCiphersFromCache } = useCipherData()
  const { cipherStore, collectionStore } = useStores()

  const [ciphers, setCiphers] = useState<CipherShareType[]>([])
  const [sortConfig, setSortConfig] = useState<YourShareSortConfig>(DEFAULT_YOUR_SHARE_SORT)

  // ------------------------ COMPUTED ----------------------------

  const organizations = [...cipherStore.organizations]
  const myShares = [...cipherStore.myShares]

  const getOrg = (id: string) => organizations.find((o: Organization) => o.id === id)
  const getShare = (id: string) => myShares.find((s) => s.id === id)

  const buildShareDescription = (members: SharedMemberType[], gl: number) => {
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
      return translate("shares:shared_with") + ` ${ml} ` + translate("shares:users")
    } else if (gl > 0) {
      return (
        translate("shares:shared_with") +
        ` ${gl} ` +
        translate(gl > 1 ? "shares:groups" : "shares:group")
      )
    }
    return ""
  }

  const sharesCollection: FolderShareType[] = [...collectionStore.collections]
    .filter((i) => getTeam(organizations, i.organizationId).type === AccountRole.OWNER)
    .map((i) => {
      const share = getShare(i.organizationId)
      return {
        collection: i,
        description: "",
        members: share?.members || [],
        groups: share?.groups || [],
      }
    })

  const sharesCiphers = ciphers.filter((c) => !c.collectionIds?.length)

  const itemsData = sortByConfig(
    sharesCiphers,
    sortConfig,
    (c) => c.name ?? "",
    (c) => c.revisionDate?.getTime() ?? 0
  )
  const collectionData = sortByConfig(
    sharesCollection,
    sortConfig,
    (f) => f.collection.name ?? "",
    () => 0
  )

  // ------------------------ METHODS ----------------------------

  const loadData = async () => {
    const filters = [
      (c: CipherView) => {
        if (!c.organizationId) {
          return false
        }
        const share = getShare(c.organizationId)
        const org = getOrg(c.organizationId)
        return (
          (org &&
            org.type === 0 &&
            share &&
            (share.members.length > 0 || share.groups.length > 0)) ||
          false
        )
      },
    ]

    const searchRes = await getCiphersFromCache({
      filters,
      searchText: "",
      deleted: false,
    })

    const res: CipherShareType[] = searchRes.map((c: CipherView) => {
      const data: CipherShareType = {
        ...c,
        imgLogo: getCipherLogo(c),
        notSync: false,
        isDeleted: c.isDeleted,
        description: "",
      }
      const share = getShare(c.organizationId)
      if (share) {
        data.description = buildShareDescription(share.members, share.groups.length)
        data.members = share.members
        data.groups = share.groups
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
    cipherStore.myShares,
    cipherStore.organizations,
  ])

  return { itemsData, collectionData, sortConfig, setSortConfig }
}
