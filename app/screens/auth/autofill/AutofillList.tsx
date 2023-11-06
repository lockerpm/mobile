import React, { useState, useEffect } from "react"
import { View, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from "lodash/orderBy"
import { AutofillListItem } from "./AutofillListItem"
import { Text } from "app/components/cores"
import { useCipherData, useCipherHelper, useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { CipherType } from "core/enums"
import { MAX_CIPHER_SELECTION } from "app/static/constants"
import { AutoFillItemAction } from "./AutofillItemAction"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"

interface AutoFillListProps {
  emptyContent?: JSX.Element
  navigation: any
  searchText?: string
  onLoadingChange?: (val: boolean) => void
  sortList?: {
    orderField: string
    order: string
  }
  isSelecting: boolean
  setIsSelecting: (val: boolean) => void
  selectedItems: string[]
  setSelectedItems: (val: any) => void
  setAllItems: (val: any) => void
}

/**
 * Describe your component here
 */
export const AutoFillList = observer((props: AutoFillListProps) => {
  const {
    emptyContent,
    navigation,
    onLoadingChange,
    searchText,
    sortList,
    isSelecting,
    setIsSelecting,
    selectedItems,
    setSelectedItems,
    setAllItems,
  } = props
  const { notify, translate } = useHelper()
  const { getWebsiteLogo } = useCipherHelper()
  const { getCiphersFromCache } = useCipherData()

  const { cipherStore } = useStores()

  // ------------------------ PARAMS ----------------------------

  const [showPasswordAction, setShowPasswordAction] = useState(false)
  const [ciphers, setCiphers] = useState([])
  const [checkedItem, setCheckedItem] = useState("")

  // ------------------------ WATCHERS ----------------------------

  useEffect(() => {
    loadData()
  }, [searchText, cipherStore.lastSync, cipherStore.lastCacheUpdate, sortList])

  useEffect(() => {
    if (checkedItem) {
      toggleItemSelection(checkedItem)
      setCheckedItem(null)
    }
  }, [checkedItem, selectedItems])

  // ------------------------ METHODS ----------------------------

  // Get ciphers list
  const loadData = async () => {
    // onLoadingChange && onLoadingChange(true)

    // Filter
    const filters = []
    filters.push((c: CipherView) => c.type === CipherType.Login)

    // Search
    const searchRes = await getCiphersFromCache({
      filters,
      searchText,
      deleted: false,
    })

    // Add image
    let res = searchRes.map((c: CipherView) => {
      const data = {
        ...c,
        logo: null,
        imgLogo: null,
        svg: null,
        notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
          c.id,
        ),
        isDeleted: c.isDeleted,
      }
      let img = {}
      const { uri } = getWebsiteLogo(c.login.uri)
      if (uri) {
        img = { uri }
      } else {
        img = BROWSE_ITEMS.password.icon
      }
      data.imgLogo = img
      data.logo = BROWSE_ITEMS.password.icon
      return data
    })

    // Sort
    if (sortList) {
      const { orderField, order } = sortList
      res =
        orderBy(
          res,
          [(c) => (orderField === "name" ? c.name && c.name.toLowerCase() : c.revisionDate)],
          [order],
        ) || []
    }

    // Delay loading
    setTimeout(() => {
      onLoadingChange && onLoadingChange(false)
    }, 100)

    // Done
    setCiphers(res)
    setAllItems(res.map((c) => c.id))
  }

  // Handle action menu open
  const openActionMenu = (item: CipherView) => {
    cipherStore.setSelectedCipher(item)
    setShowPasswordAction(true)
  }

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    if (!isSelecting) {
      setIsSelecting(true)
    }
    let selected = [...selectedItems]
    if (!selected.includes(id)) {
      if (selected.length === MAX_CIPHER_SELECTION) {
        notify("error", translate("error.cannot_select_more", { count: MAX_CIPHER_SELECTION }))
        return
      }
      selected.push(id)
    } else {
      selected = selected.filter((i) => i !== id)
    }
    setSelectedItems(selected)
  }

  // ------------------------ RENDER ----------------------------

  const renderItem = ({ item }) => (
    <AutofillListItem
      item={item}
      isSelecting={isSelecting}
      toggleItemSelection={setCheckedItem}
      openActionMenu={openActionMenu}
      isSelected={selectedItems.includes(item.id)}
    />
  )

  return ciphers.length ? (
    <View style={{ flex: 1 }}>
      <AutoFillItemAction
        isOpen={showPasswordAction}
        onClose={() => setShowPasswordAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
      />

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
    </View>
  ) : emptyContent && !searchText.trim() ? (
    <View style={{ paddingHorizontal: 20 }}>{emptyContent}</View>
  ) : (
    <View style={{ paddingHorizontal: 20 }}>
      <Text
        text={translate("error.no_results_found") + ` '${searchText}'`}
        style={{
          textAlign: "center",
        }}
      />
    </View>
  )
})
