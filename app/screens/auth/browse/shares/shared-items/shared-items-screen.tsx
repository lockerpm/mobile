import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, CipherList, BrowseItemHeader, BrowseItemEmptyContent } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../../../home/all-item/sort-action"
import { AddAction } from "../../../home/all-item/add-action"
import { useMixins } from "../../../../../services/mixins"
import { BackHandler } from "react-native"
import { useStores } from "../../../../../models"


export const SharedItemsScreen = observer(() => {
  const navigation = useNavigation()
  const { translate } = useMixins()
  const { uiStore } = useStores()

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [sortList, setSortList] = useState({
    orderField: 'name',
    order: 'asc'
  })
  const [sortOption, setSortOption] = useState('az')
  const [selectedItems, setSelectedItems] = useState([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [allItems, setAllItems] = useState([])

  // Close select before leave
  useEffect(() => {
    uiStore.setIsSelecting(isSelecting)
    const checkSelectBeforeLeaving = () => {
      if (isSelecting) {
        setIsSelecting(false)
        setSelectedItems([])
        return true
      }
      return false
    }
    BackHandler.addEventListener('hardwareBackPress', checkSelectBeforeLeaving)
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', checkSelectBeforeLeaving)
    }
  }, [isSelecting])

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <BrowseItemHeader
          header={translate('shares.shared_items')}
          openSort={() => setIsSortOpen(true)}
          openAdd={() => setIsAddOpen(true)}
          onSearch={setSearchText}
          searchText={searchText}
          navigation={navigation}
          isSelecting={isSelecting}
          setIsSelecting={setIsSelecting}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          setIsLoading={setIsLoading}
          toggleSelectAll={() => {
            if (selectedItems.length < allItems.length) {
              setSelectedItems(allItems)
            } else {
              setSelectedItems([])
            }
          }}
        />
      )}
      borderBottom
      noScroll
    >
      <SortAction
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        onSelect={(value: string, obj: { orderField: string, order: string }) => {
          setSortOption(value)
          setSortList(obj)
        }}
        value={sortOption}
      />

      <AddAction
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        navigation={navigation}
      />

      <CipherList
        navigation={navigation}
        onLoadingChange={setIsLoading}
        searchText={searchText}
        sortList={sortList}
        organizationId={null}
        isSelecting={isSelecting}
        setIsSelecting={setIsSelecting}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        setAllItems={setAllItems}
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            imgStyle={{ height: 55, width: 55 }}
            title={translate('shares.empty.title')}
            desc={translate('shares.empty.desc')}
          />
        )}
      />
    </Layout>
  )
})
