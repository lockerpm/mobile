import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { ShareMultipleHeader } from "./items-header"
import { CipherList, Layout } from "../../../../../components"
import { SortAction } from "../../../home/all-item/sort-action"
import { AddAction } from "../../../home/all-item/add-action"


export const ShareMultipleScreen = observer(() => {
  const navigation = useNavigation()

  // -------------- PARAMS ------------------

  const [isLoading, setIsLoading] = useState(true)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [sortList, setSortList] = useState({
    orderField: 'revisionDate',
    order: 'desc'
  })
  const [sortOption, setSortOption] = useState('last_updated')
  const [selectedItems, setSelectedItems] = useState([])
  const [allItems, setAllItems] = useState([])

  // -------------- EFFECT ------------------

  // -------------- RENDER ------------------

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <ShareMultipleHeader
          navigation={navigation}
          openSort={() => setIsSortOpen(true)}
          openAdd={() => setIsAddOpen(true)}
          onSearch={setSearchText}
          searchText={searchText}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
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
        isSelecting={true}
        setIsSelecting={() => {}}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        setAllItems={setAllItems}
      />
    </Layout>
  )
})
