/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react"

import { CipherType } from "core/enums"
import { CipherView } from "core/models/view"

import { useStores } from "@/models"
import { useCipherData } from "@/services/hook"
import { CipherAppView } from "@/static/types"
import { getCipherLogo } from "@/utils/cipherHelper"

// --- Host matching helpers ---
function dataFromMaybeUrl(input?: string): { host?: string } {
  if (!input) return {}
  try {
    // If it's already a bare host like "example.com" URL will accept it if we add a scheme.
    const url = input.includes("://") ? new URL(input) : new URL("https://" + input)
    return { host: url.hostname }
  } catch (e) {
    // Fallback: maybe it's just a host
    return { host: input }
  }
}

function stripCommon(host?: string) {
  if (!host) return host
  let h = host.toLowerCase()
  // Remove common
  h = h.replace(/^www\./, "")
  h = h.replace(/^m\./, "")
  h = h.replace(/^mobile\./, "")

  h = h.replace(/^(com|org|net|io|gov|edu)\./, "")
  h = h.replace(/\.(com|org|net|io|gov|edu)$/, "")
  return h
}

function isUriHostMatch(uriA?: string, uriB?: string) {
  if (!uriA || !uriB) return false
  const hostA = dataFromMaybeUrl(uriA).host
  const hostB = dataFromMaybeUrl(uriB).host
  if (!hostA || !hostB) return false

  const domA = stripCommon(hostA)
  const domB = stripCommon(hostB)
  if (!domA || !domB) return false

  return domA === domB
}

export const useCreatePasskeyData = (rpId: string, userName: string) => {
  const { cipherStore } = useStores()
  const { getCiphersFromCache } = useCipherData()
  const [loginPasskeys, setLoginPasskeys] = useState<CipherAppView[]>([])

  const existingPasskeys =
    loginPasskeys.find((c) => {
      return (
        c.login.fido2Credentials?.some(
          (cred) => cred.rpId === rpId && cred.userName === userName
        ) ?? false
      )
    }) || null
  // Get ciphers list
  const loadData = async () => {
    // Search
    const searchRes = await getCiphersFromCache({
      filters: [
        (c: CipherView) => {
          if (c.type !== CipherType.Login) {
            return false
          }

          if (c.login.fido2Credentials?.some((cred) => cred.rpId === rpId)) {
            return true
          }

          // otherwise, match by login URIs (use a tolerant host matcher)
          return c.login.uris?.some((u) => isUriHostMatch(u.uri, rpId))
        },
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
  }

  useEffect(() => {
    loadData()
  }, [cipherStore.lastSync, cipherStore.lastCacheUpdate])

  return {
    existingPasskeys,
    loginPasskeys,
  }
}
