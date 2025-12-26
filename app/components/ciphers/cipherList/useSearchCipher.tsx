import { useCallback, useEffect, useMemo, useState } from "react"
import { debounce } from "lodash"

import { CipherType } from "core/enums"

import { CipherAppView } from "@/static/types"

export const useSearchCipher = (ciphers: CipherAppView[]) => {
  const [searchText, setSearchText] = useState("")
  const [filtered, setFiltered] = useState<CipherAppView[]>(ciphers)

  const handleSearch = useCallback((text: string, ciphers: CipherAppView[]) => {
    const lowerParts = text
      .toLowerCase()
      .trim()
      .split(" ")
      .filter((t) => t.length >= 2)

    if (lowerParts.length >= 2) {
      const res = ciphers.filter((c) => {
        const nameFiltered =
          c.name?.toLowerCase().includes(lowerParts[0]) ||
          c.name?.toLowerCase().includes(lowerParts[1])
        if (nameFiltered) {
          return true
        }
        if (c.type === CipherType.Login) {
          const login =
            c.login.username?.includes(lowerParts[0]) || c.login.username?.includes(lowerParts[1])
          const url =
            c.login.uri?.toLowerCase().includes(lowerParts[0]) ||
            c.login.uri?.toLowerCase().includes(lowerParts[1])
          return login || url
        }
        return false
      })
      setFiltered(res)
      return
    }
    if (lowerParts.length === 1) {
      const res = ciphers.filter((c) => {
        const nameFiltered = c.name?.toLowerCase().includes(lowerParts[0])
        if (nameFiltered) {
          return true
        }
        if (c.type === CipherType.Login) {
          const login = c.login.username?.includes(lowerParts[0])
          const url = c.login.uri?.toLowerCase().includes(lowerParts[0])
          return login || url
        }
        return false
      })
      setFiltered(res)
      return
    }
    setFiltered(ciphers)
  }, [])

  const debouncedSearch = useMemo(() => debounce(handleSearch, 300), [handleSearch])

  useEffect(() => {
    if (!searchText || !searchText.trim()) {
      setFiltered(ciphers)
      return
    } else {
      debouncedSearch(searchText, ciphers)
    }
  }, [ciphers, debouncedSearch, searchText])

  return {
    searchText,
    onChangeText: setSearchText,
    filteredCiphers: filtered,
    setFiltered,
  }
}
