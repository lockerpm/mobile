import { useState } from "react"

/**
 * Generic search/filter-by-name hook shared by the "Shared with me" and
 * "Your shares" tab scenes. The caller supplies a `getName` selector so the
 * same hook works for cipher items and collections regardless of shape.
 */
export const useSearch = <T>(items: T[], getName: (item: T) => string) => {
  const [searchText, setSearchText] = useState("")

  const query = searchText.trim().toLowerCase()
  const filtered = query
    ? items.filter((item) => getName(item).toLowerCase().includes(query))
    : items

  return { searchText, setSearchText, filtered }
}
