import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { CipherList, Layout } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useCoreService } from "../../../../services/core-service"
import { ItemEmptyContent } from "./empty-content"
import { ItemsHeader } from "./items-header"
import { SortAction } from "./sort-action"
import { AddAction } from "./add-action"


export const AllItemScreen = observer(function AllItemScreen() {
  const navigation = useNavigation()
  const { searchService } = useCoreService()

  const [isLoading, setIsLoading] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  // ------------ METHODS -------------------

  const getCiphers = async () => {
    setIsLoading(true)
    try {
      const searchText = null
      const searchFilter = null
      const res = await searchService.searchCiphers(searchText, [searchFilter], null)
      console.log(res)
    } catch (e) {
      console.log('main error')
      console.log(e)
    }
    setIsLoading(false)
  }

  // const createCipher = async () => {
  //   setIsLoading(true)
  //   const cipher = newCipher()
  //   cipher.name = 'test 123'
  //   const cipherEnc = await cipherService.encrypt(cipher)
  //   const data = new CipherRequest(cipherEnc)
  //   const res = await cipherStore.createCipher(data)
  //   console.log(res)
  //   setIsLoading(false)
  // }

  // useEffect(() => {
  //   if (!isScreenReady) {
  //     getCiphers()
  //     setIsScreenReady(true)
  //   }
  // }, [isScreenReady])

  return (
    <Layout
      isContentLoading={isLoading}
      header={(
        <ItemsHeader 
          openSort={() => setIsSortOpen(true)}
          openAdd={() => setIsAddOpen(true)}
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
        emptyContent={(
          <ItemEmptyContent 
            addItem={() => {
              setIsAddOpen(true)
            }}
          />
        )}
      />
    </Layout>
  )
})
