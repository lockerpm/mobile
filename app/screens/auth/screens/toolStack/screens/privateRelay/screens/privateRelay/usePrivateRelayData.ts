import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useStores } from "app/models"
import { RelayAddress, SubdomainData } from "app/static/types"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { debounce } from "app/utils/utils"

import { useAppLocale } from "@/i18n"
import { useToast } from "@/services/utils"

const FREE_PLAN_ALIAS_LIMIT = 1

export interface AliasSection {
  key: "editable" | "random"
  title: string
  isEditable: boolean
  data: RelayAddress[]
}

/** Append `next` to `prev`, skipping aliases that are already in the list. */
const mergeAliases = (prev: RelayAddress[], next: RelayAddress[]) => {
  const ids = new Set(prev.map((a) => a.id))
  return [...prev, ...next.filter((a) => !ids.has(a.id))]
}

export const usePrivateRelayData = () => {
  const { toolStore, user } = useStores()
  const { notifyApiError } = useToast()
  const { translate } = useAppLocale()

  const userEmail = user.email || ""
  const isFreeAccount = user.isFreePlan

  // API: first item of page 1 is the editable alias, the rest are random aliases newest first
  const [aliases, setAliases] = useState<RelayAddress[]>([])
  const [subdomain, setSubdomain] = useState<SubdomainData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const nextPageRef = useRef(1)
  const hasMoreRef = useRef(true)
  const loadingRef = useRef(false)
  // useToast returns a new function every render; keep the latest in a ref so callbacks stay stable
  const notifyApiErrorRef = useRef(notifyApiError)
  notifyApiErrorRef.current = notifyApiError

  // ----------------------------METHODS----------------------------

  const fetchSubdomain = useCallback(async () => {
    const res = await toolStore.fetchSubdomain()
    if (res.kind === "ok") {
      setSubdomain(res.data.results[0] ?? null)
    }
  }, [toolStore])

  const fetchAliases = useCallback(
    async (page: number) => {
      if (loadingRef.current) return
      loadingRef.current = true
      setIsLoading(true)

      const res = await toolStore.fetchRelayListAddresses(page)
      if (res.kind === "ok") {
        const { results, next } = res.data
        setAliases((prev) => (page === 1 ? results : mergeAliases(prev, results)))
        nextPageRef.current = page + 1
        hasMoreRef.current = !!next
      } else {
        notifyApiErrorRef.current(res)
      }

      loadingRef.current = false
      setIsLoading(false)
    },
    [toolStore]
  )

  const loadMore = useCallback(() => {
    if (!hasMoreRef.current) return
    fetchAliases(nextPageRef.current)
  }, [fetchAliases])

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    await Promise.all([fetchAliases(1), fetchSubdomain()])
    setIsRefreshing(false)
  }, [fetchAliases, fetchSubdomain])

  const createAlias = useMemo(
    () =>
      debounce(async () => {
        setIsCreating(true)
        const res = await toolStore.generateRelayNewAddress()
        if (res.kind === "ok") {
          logFirebaseEvent(AnalyticEvents.CREATE_PRIVATE_EMAIL, userEmail)
          // Keep the editable alias first; the new alias is the newest random one
          setAliases((prev) =>
            prev.length === 0 ? [res.data] : mergeAliases([prev[0], res.data], prev.slice(1))
          )
        } else {
          notifyApiErrorRef.current(res)
        }
        setIsCreating(false)
      }, 400),
    [toolStore, userEmail]
  )

  // ----------------------------EFFECTS----------------------------

  useEffect(() => {
    fetchAliases(1)
    fetchSubdomain()
  }, [fetchAliases, fetchSubdomain])

  useEffect(() => {
    const listeners = [
      EventBus.createListener(AppEventType.PRIVATE_RELAY_DELETE, (id: number) => {
        setAliases((prev) => prev.filter((a) => a.id !== id))
      }),
      EventBus.createListener(AppEventType.PRIVATE_RELAY_UPDATE, (data: RelayAddress) => {
        setAliases((prev) => prev.map((a) => (a.id === data.id ? data : a)))
      }),
      EventBus.createListener(AppEventType.PRIVATE_RELAY_DOMAIN_EDIT, (domain: string) => {
        setSubdomain((prev) => (prev ? { ...prev, subdomain: domain } : prev))
      }),
      EventBus.createListener(AppEventType.PRIVATE_RELAY_DOMAIN_CREATE, (data: SubdomainData) => {
        setSubdomain(data)
      }),
    ]
    return () => listeners.forEach((l) => EventBus.removeListener(l))
  }, [])

  // ----------------------------COMPUTED----------------------------

  const sections = useMemo<AliasSection[]>(() => {
    if (aliases.length === 0) return []
    const randomAliases = aliases.slice(1)
    const result: AliasSection[] = [
      {
        key: "editable",
        title: translate("private_relay:editable"),
        isEditable: true,
        data: [aliases[0]],
      },
    ]
    if (randomAliases.length > 0) {
      result.push({
        key: "random",
        title: translate("private_relay:random", { number: ` (${randomAliases.length})` }),
        isEditable: false,
        data: randomAliases,
      })
    }
    return result
  }, [aliases, translate])

  return {
    userEmail,
    isFreeAccount,
    isReachLimit: isFreeAccount && aliases.length >= FREE_PLAN_ALIAS_LIMIT,
    sections,
    subdomain,
    isLoading,
    isRefreshing,
    isCreating,
    loadMore,
    refresh,
    createAlias,
  }
}
