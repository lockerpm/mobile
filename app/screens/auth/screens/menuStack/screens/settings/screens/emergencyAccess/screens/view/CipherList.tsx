import React, { useState, useEffect } from "react"
import { View, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { CipherListItem } from "app/components/ciphers"

export interface CipherListProps {
  ciphers: any[]
  emptyContent?: JSX.Element
  navigation: any
  searchText?: string
  onLoadingChange?: (val: boolean) => void
}

/**
 * Describe your component here
 */
export const CipherList = observer((props: CipherListProps) => {
  const { emptyContent, navigation, onLoadingChange, ciphers } = props
  const { cipherStore } = useStores()

  // ------------------------ PARAMS ----------------------------

  const [checkedItem, setCheckedItem] = useState("")

  // ------------------------ COMPUTED ----------------------------

  // ------------------------ EFFECTS ----------------------------
  useEffect(() => {
    if (checkedItem) {
      setCheckedItem(null)
    }
  }, [checkedItem])

  // ------------------------ METHODS ----------------------------

  // Handle action menu open
  const openActionMenu = (item: CipherView) => {
    cipherStore.setSelectedCipher(item)
  }

  // ------------------------ RENDER ----------------------------

  const renderItem = ({ item }) => {
    return (
      <CipherListItem
        item={item}
        isSelecting={false}
        toggleItemSelection={setCheckedItem}
        openActionMenu={openActionMenu}
        isSelected={false}
        isShared={false}
      />
    )
  }

  return ciphers.length ? (
    <View style={{ flex: 1 }}>
      {/* Action menus */}

      {/* Cipher list */}
      <FlatList
        style={{
          paddingHorizontal: 20,
        }}
        data={ciphers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        getItemLayout={(data, index) => ({
          length: 71,
          offset: 71 * index,
          index,
        })}
      />
      {/* Cipher list end */}
    </View>
  ) : (
    emptyContent && <View style={{ paddingHorizontal: 20 }}>{emptyContent}</View>
  )
})
