/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react-lite'
import orderBy from 'lodash/orderBy'
import sortBy from 'lodash/sortBy'
import { AuthenticatorAction } from './AuthenticatorAction'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { OtpListItem } from './OtpListItem'
import { Text } from 'app/components/cores'
import { useCipherData, useHelper } from 'app/services/hook'
import { useStores } from 'app/models'
import { CipherView } from 'core/models/view'
import { CipherType } from 'core/enums'
import { MAX_CIPHER_SELECTION } from 'app/static/constants'
import { translate } from 'app/i18n'

interface Props {
  navigation: any
  emptyContent?: JSX.Element
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
export const OtpList = observer((props: Props) => {
  const {
    navigation,
    emptyContent,
    onLoadingChange,
    searchText,
    sortList,
    isSelecting,
    setIsSelecting,
    selectedItems,
    setSelectedItems,
    setAllItems,
  } = props
  const { notify } = useHelper()
  const { getCiphersFromCache } = useCipherData()
  const { cipherStore, toolStore } = useStores()

  // ------------------------ PARAMS ----------------------------

  const [selectedOtp, setSelectedOtp] = useState(new CipherView())
  const [isActionOpen, setIsActionOpen] = useState(false)
  const [ciphers, setCiphers] = useState([])
  const [checkedItem, setCheckedItem] = useState('')

  // ------------------------ EFFECT ----------------------------

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
    onLoadingChange && onLoadingChange(true)

    // Filter
    const filters = [(c: CipherView) => c.type === CipherType.TOTP]

    // Search
    const searchRes = await getCiphersFromCache({
      filters,
      searchText,
      deleted: false,
      includeExtensions: true,
    })

    // Add more info
    let res = searchRes.map((c: CipherView) => {
      const data = {
        ...c,
        notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
          c.id
        ),
      }
      return data
    })

    // Sort
    if (sortList) {
      const { orderField, order } = sortList
      res =
        orderBy(
          res,
          [(c) => (orderField === 'name' ? c.name && c.name.toLowerCase() : c.revisionDate)],
          [order]
        ) || []
    }

    // Delay loading
    setTimeout(() => {
      onLoadingChange && onLoadingChange(false)
    }, 100)

    // Done
    const sortedData =
      toolStore.authenticatorOrder.length > 0
        ? sortBy(res, (item: CipherView) => {
            return toolStore.authenticatorOrder.indexOf(item.id)
          })
        : [...res]
    setCiphers(sortedData)
    setAllItems(sortedData.map((c) => c.id))
  }

  // Handle action menu open
  const openActionMenu = (item: CipherView) => {
    setSelectedOtp(item)
    setIsActionOpen(true)
  }

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    if (!isSelecting) {
      setIsSelecting(true)
    }
    let selected = [...selectedItems]
    if (!selected.includes(id)) {
      if (selected.length === MAX_CIPHER_SELECTION) {
        notify('error', translate('error.cannot_select_more', { count: MAX_CIPHER_SELECTION }))
        return
      }
      selected.push(id)
    } else {
      selected = selected.filter((i) => i !== id)
    }
    setSelectedItems(selected)
  }

  // Handle changing order
  const handleChangeOrder = ({ data }) => {
    setCiphers(data)
    toolStore.setAuthenticatorOrder(data.map((i: CipherView) => i.id))
  }

  // ------------------------ RENDER ----------------------------

  const renderItem = ({ item, index, drag, isActive }) => (
    <OtpListItem
      item={item}
      isSelecting={isSelecting}
      toggleItemSelection={setCheckedItem}
      openActionMenu={openActionMenu}
      isSelected={selectedItems.includes(item.id)}
      drag={drag}
    />
  )

  return ciphers.length ? (
    <View style={{ flex: 1 }}>
      {/* Action menus */}

      <AuthenticatorAction
        navigation={navigation}
        isOpen={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        onLoadingChange={onLoadingChange}
        cipher={selectedOtp}
      />

      {/* Action menus end */}

      {/* Cipher list */}
      <DraggableFlatList
        style={{ paddingHorizontal: 20, height: '100%' }}
        data={ciphers}
        keyExtractor={(item) => item.id.toString()}
        onDragEnd={handleChangeOrder}
        renderItem={renderItem}
      />
      {/* Cipher list end */}
    </View>
  ) : emptyContent && !searchText.trim() ? (
    <View style={{ paddingHorizontal: 20 }}>{emptyContent}</View>
  ) : (
    <View style={{ paddingHorizontal: 20 }}>
      <Text
        text={translate('error.no_results_found') + ` '${searchText}'`}
        style={{
          textAlign: 'center',
        }}
      />
    </View>
  )
})
