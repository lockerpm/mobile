import { useCallback, useEffect, useState } from "react"

import { CipherType } from "core/enums"
import { CipherView } from "core/models/view"

import { useCipherData } from "@/services/hook"
import { CipherAppView } from "@/static/types"
import { getCipherLogo } from "@/utils/cipherHelper"

export const useMasterPasswordCipher = () => {
  const { getCiphersFromCache } = useCipherData()

  const [masterPassword, setMasterPassword] = useState<CipherAppView | null>(null)

  const loadData = useCallback(async () => {
    // filter
    const filters = [(c: CipherView) => c.type === CipherType.MasterPassword]

    // Search
    const searchRes = await getCiphersFromCache({
      filters,
      searchText: "",
      deleted: false,
    })

    if (searchRes.length === 0) {
      setMasterPassword(null)
      return
    }

    // Add image
    const res: CipherAppView[] = searchRes.map((c: CipherView) => {
      const cipherLogo = getCipherLogo(c)
      const data = {
        ...c,
        imgLogo: cipherLogo,
        notSync: false,
        isDeleted: false,
      }
      return data
    })

    setMasterPassword(res[0] || null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    masterPassword,
  }
}
