import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, CipherList, BrowseItemHeader, BrowseItemEmptyContent } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../../home/all-item/sort-action"
import { CipherType } from "../../../../../core/enums"


export const PasswordsScreen = observer(function PasswordsScreen() {
  const navigation = useNavigation()
  
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <BrowseItemHeader
          header="Password"
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {
            navigation.navigate('passwords__edit', { mode: 'add' })
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
        cipherType={CipherType.Login}
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            title="Foget password resets"
            desc="Add your passwords and access them on any device, anytime"
            buttonText="Add Password"
            addItem={() => {
              navigation.navigate('passwords__edit', { mode: 'add' })
            }}
          />
        )}
      />
    </Layout>
  )
})
