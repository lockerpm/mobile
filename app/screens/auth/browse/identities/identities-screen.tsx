import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, CipherList, BrowseItemHeader, BrowseItemEmptyContent } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../../home/all-item/sort-action"


export const IdentitiesScreen = observer(function IdentitiesScreen() {
  const navigation = useNavigation()
  
  const [isSortOpen, setIsSortOpen] = useState(false)

  return (
    <Layout
      header={(
        <BrowseItemHeader
          header="Personal Info"
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {
            navigation.navigate('identities__edit', { mode: 'add' })
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
