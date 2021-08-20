import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, CipherList, BrowseItemHeader, BrowseItemEmptyContent } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../../home/all-item/sort-action"
import { CipherType } from "../../../../../core/enums"


export const IdentitiesScreen = observer(function IdentitiesScreen() {
  const navigation = useNavigation()
  
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <BrowseItemHeader
          header="Personal Info"
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {
            navigation.navigate('identities__edit', { mode: 'add' })
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
        cipherType={CipherType.Identity}
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            title="Fill out online forms"
            desc="Save your address and contact details to fill out registration forms quickly"
            buttonText="Add Identity"
            addItem={() => {
              navigation.navigate('identities__edit', { mode: 'add' })
            }}
          />
        )}
      />
    </Layout>
  )
})
