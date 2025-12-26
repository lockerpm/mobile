import { useEffect, useState } from "react"

import { CipherType } from "core/enums"
import { compareCredentialIds, parseCredentialId } from "core/misc/fido2/credential-id-utils"
import { Fido2Utils } from "core/misc/fido2/fido2-utils"
import { CipherView } from "core/models/view"

import { useStores } from "@/models"
import { useCipherData } from "@/services/hook"
import { CipherAppView } from "@/static/types"
import { getCipherLogo } from "@/utils/cipherHelper"

export const usePasskeyListData = (requestObj: PublicKeyCredentialRequestOptionsJSON) => {
  const { cipherStore } = useStores()
  const { getCiphersFromCache } = useCipherData()

  const [loginPasskeys, setLoginPasskeys] = useState<CipherAppView[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const allowCredentialIds = requestObj.allowCredentials?.map((cred) => cred.id) || []

  const allowPasskeys = loginPasskeys.filter((cipher) => {
    const fido2Creds = cipher.login.fido2Credentials || []
    return fido2Creds.some((cred) =>
      allowCredentialIds.some((id) =>
        compareCredentialIds(Fido2Utils.stringToBuffer(id), parseCredentialId(cred.credentialId))
      )
    )
  })

  // ------------------------ DATA ----------------------------
  // Get ciphers list
  const loadData = async () => {
    // Search
    const searchRes = await getCiphersFromCache({
      filters: [
        (c: CipherView) =>
          c.type === CipherType.Login &&
          c.login.hasFido2Credentials &&
          c.login.fido2Credentials?.some((cred) => cred.rpId === requestObj.rpId),
      ],
      searchText: "",
      deleted: false,
    })

    // Add image
    const res = searchRes.map((c: CipherView) => {
      const cipherLogo = getCipherLogo(c)
      const data = {
        ...c,
        imgLogo: cipherLogo,
        notSync: false,
        isDeleted: c.isDeleted,
      }
      return data
    })

    // Done
    setLoginPasskeys(res)
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [cipherStore.lastSync, cipherStore.lastCacheUpdate])

  return {
    isLoading,
    loginPasskeys: allowPasskeys.length > 0 ? allowPasskeys : loginPasskeys,
  }
}
