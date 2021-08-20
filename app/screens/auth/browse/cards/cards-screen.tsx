import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, CipherList, BrowseItemHeader, BrowseItemEmptyContent } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../../home/all-item/sort-action"
import { CipherType } from "../../../../../core/enums"


export const CardsScreen = observer(function CardsScreen() {
  const navigation = useNavigation()
  
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <BrowseItemHeader
          header="Credit Card"
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {
            navigation.navigate('cards__edit', { mode: 'add' })
          }}
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
      />
      
      <CipherList
        navigation={navigation}
        onLoadingChange={setIsLoading}
        searchText={searchText}
        cipherType={CipherType.Card}
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            title="Quick & convenient shopping"
            desc="Add payment card details to autofill when shopping online"
            buttonText="Add Card"
            addItem={() => {
              navigation.navigate('cards__edit', { mode: 'add' })
            }}
          />
        )}
      />
    </Layout>
  )
})
