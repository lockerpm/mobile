import { useState } from "react"

/**
 * Generic search/filter-by-name hook shared by the "Shared with me" tabs.
 * Works for both cipher items and collections since the caller supplies a
 * `getName` selector (both wrap their name at `item.data.name`).
 */
export const useSearch = <T>(items: T[], getName: (item: T) => string) => {
  const [searchText, setSearchText] = useState("")

  const query = searchText.trim().toLowerCase()
  const filtered = query
    ? items.filter((item) => getName(item).toLowerCase().includes(query))
    : items

  return { searchText, setSearchText, filtered }
}
