import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, CipherList, BrowseItemHeader, BrowseItemEmptyContent } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../../home/all-item/sort-action"


export const NotesScreen = observer(function NotesScreen() {
  const navigation = useNavigation()
  
  const [isSortOpen, setIsSortOpen] = useState(false)

  return (
    <Layout
      header={(
        <BrowseItemHeader
          header="Secure Note"
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {
            navigation.navigate('notes__edit', { mode: 'add' })
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
