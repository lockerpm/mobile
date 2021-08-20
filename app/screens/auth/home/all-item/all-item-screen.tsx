import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { CipherList, Layout, BrowseItemEmptyContent } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { ItemsHeader } from "./items-header"
import { SortAction } from "./sort-action"
import { AddAction } from "./add-action"


export const AllItemScreen = observer(function AllItemScreen() {
  const navigation = useNavigation()
  const [isLoading, setIsLoading] = useState(true)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchText, setSearchText] = useState('')

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <ItemsHeader 
          openSort={() => setIsSortOpen(true)}
          openAdd={() => setIsAddOpen(true)}
          onSearch={setSearchText}
        />
      )}
      borderBottom
      noScroll
    >
      <SortAction 
        isOpen={isSortOpen} 
        onClose={() => setIsSortOpen(false)}
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
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            title="Add your first item"
            desc="Create your first item to start building your vault"
            buttonText="Add Item"
            addItem={() => {
              setIsAddOpen(true)
            }}
          />
        )}
      />
    </Layout>
  )
})
