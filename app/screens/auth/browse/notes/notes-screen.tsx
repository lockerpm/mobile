import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, CipherList, BrowseItemHeader, BrowseItemEmptyContent } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../../home/all-item/sort-action"
import { CipherType } from "../../../../../core/enums"


export const NotesScreen = observer(function NotesScreen() {
  const navigation = useNavigation()
  
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <BrowseItemHeader
          header="Secure Note"
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {
            navigation.navigate('notes__edit', { mode: 'add' })
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
        cipherType={CipherType.SecureNote}
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            title="Free your memory"
            desc="Jot down a WiFi code, office security alarm code or your friend’s birthday"
            buttonText="Add Note"
            addItem={() => {
              navigation.navigate('notes__edit', { mode: 'add' })
            }}
          />
        )}
      />
    </Layout>
  )
})
