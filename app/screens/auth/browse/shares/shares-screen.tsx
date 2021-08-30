import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, CipherList, BrowseItemHeader, BrowseItemEmptyContent } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../../home/all-item/sort-action"
import { AddAction } from "../../home/all-item/add-action"


export const SharesScreen = observer(function SharesScreen() {
  const navigation = useNavigation()
  
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [sortList, setSortList] = useState({
    orderField: 'name',
    order: 'asc'
  })
  const [sortOption, setSortOption] = useState('az')

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <BrowseItemHeader
          header="Share Items"
          openSort={() => setIsSortOpen(true)}
          openAdd={() => setIsAddOpen(true)}
          onSearch={setSearchText}
          navigation={navigation}
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
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            title="Securely share items"
            desc="Any shared or received passwords, notes or credit cards will appear here"
          />
        )}
      />
    </Layout>
  )
})
