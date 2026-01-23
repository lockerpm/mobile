import { useEffect } from "react"
import { useAtom } from "jotai"

import { CipherView } from "core/models/view/cipherView"

import { useStores } from "@/models"
import { useCipherData } from "@/services/hook/useCipherData"
import { confirmShareAtom } from "@/services/utils/useConfirmShare"
import { SharingStatus } from "@/static/types/enum"
import { delay } from "@/utils/delay"

export const useLoadConfirmShare = () => {
  const { cipherStore } = useStores()
  const { getCiphersFromCache } = useCipherData()

  const [confirmShareCount, setConfirmShareCount] = useAtom(confirmShareAtom)

  const myShareAcceptCount = [...cipherStore.myShares].reduce((total, s) => {
    return total + s.members.filter((m) => m.status === SharingStatus.ACCEPTED).length
  }, 0)

  const _getShare = (id: string) => {
    return [...cipherStore.myShares].find((s) => s.id === id)
  }

  // Get ciphers list
  const loadData = async () => {
    await delay(1500)
    const filters = [
      (c: CipherView) => {
        if (!c.organizationId) {
          return false
        }
        const share = _getShare(c.organizationId)
        return (share && share.members.some((m) => m.status === SharingStatus.ACCEPTED)) || false
      },
    ]

    // Search
    const searchRes = await getCiphersFromCache({
      filters,
      searchText: "",
      deleted: false,
    })
    setConfirmShareCount(searchRes.length)
  }

  useEffect(() => {
    if (myShareAcceptCount > 0) {
      loadData()
    } else {
      setConfirmShareCount(0)
    }
  }, [myShareAcceptCount])

  return { confirmShareCount }
}
