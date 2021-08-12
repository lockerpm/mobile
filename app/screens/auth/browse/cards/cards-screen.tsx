import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, CipherList, BrowseItemHeader, BrowseItemEmptyContent } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../../home/all-item/sort-action"


export const CardsScreen = observer(function CardsScreen() {
  const navigation = useNavigation()
  
  const [isSortOpen, setIsSortOpen] = useState(false)

  return (
    <Layout
      header={(
        <BrowseItemHeader
          header="Credit Card"
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {
            navigation.navigate('cards__edit', { mode: 'add' })
          }}
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
