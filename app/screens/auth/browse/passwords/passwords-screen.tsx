import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Layout, CipherList } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { PasswordsEmptyContent } from "./empty-content"
import { PasswordsHeader } from "./passwords-header"
import { SortAction } from "../../home/all-item/sort-action"


export const PasswordsScreen = observer(function PasswordsScreen() {
  const navigation = useNavigation()
  
  const [isSortOpen, setIsSortOpen] = useState(false)

  return (
    <Layout
      header={(
        <PasswordsHeader 
          openSort={() => setIsSortOpen(true)}
          openAdd={() => {
            navigation.navigate('passwords__edit', { mode: 'add' })
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
          <PasswordsEmptyContent 
            addItem={() => {
              navigation.navigate('passwords__edit', { mode: 'add' })
            }}
          />
        )}
      />
    </Layout>
  )
})
