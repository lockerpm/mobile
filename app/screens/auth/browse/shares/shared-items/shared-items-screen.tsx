import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, BrowseItemHeader, BrowseItemEmptyContent } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../../../home/all-item/sort-action"
import { useMixins } from "../../../../../services/mixins"
import { BackHandler } from "react-native"
import { useStores } from "../../../../../models"
import { CipherSharedList } from "./cipher-shared-list"
import { PushNotifier } from "../../../../../utils/push-notification"


export const SharedItemsScreen = observer(() => {
  const navigation = useNavigation()
  const { translate } = useMixins()
  const { uiStore } = useStores()

  // ------------------------ PARAMS -------------------------

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [sortList, setSortList] = useState({
    orderField: 'revisionDate',
    order: 'desc'
  })
  const [sortOption, setSortOption] = useState('last_updated')
  const [selectedItems, setSelectedItems] = useState([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [allItems, setAllItems] = useState([])

  // ------------------------ EFFECTS -------------------------

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

  // Clear noti
  useEffect(() => {
    PushNotifier.cancelNotification('share_new')
  }, [navigation])

  // ------------------------ RENDER -------------------------

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <BrowseItemHeader
          isShared
          header={translate('shares.shared_items')}
          openSort={() => setIsSortOpen(true)}
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
      hasBottomNav
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

      <CipherSharedList
        navigation={navigation}
        onLoadingChange={setIsLoading}
        searchText={searchText}
        sortList={sortList}
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
            desc={translate('shares.empty.desc_shared')}
          />
        )}
      />
    </Layout>
  )
})
