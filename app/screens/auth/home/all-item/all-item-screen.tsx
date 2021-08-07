import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Input } from "native-base"
import Icon from 'react-native-vector-icons/FontAwesome'
import { Loading, Screen, Text, Button, Layout, Header } from "../../../../components"
// import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../../models"
import { color, commonStyles } from "../../../../theme"
import { useCoreService } from "../../../../services/core-service"
import { CardView, CipherView, IdentityView, LoginUriView, LoginView, SecureNoteView } from "../../../../../core/models/view"
import { CipherType, SecureNoteType } from "../../../../../core/enums"
import { CipherRequest } from "../../../../../core/models/request/cipherRequest"


export const AllItemScreen = observer(function AllItemScreen() {
  const { cipherStore } = useStores()
  // const navigation = useNavigation()
  const { searchService, cipherService } = useCoreService()
  const [isLoading, setIsLoading] = useState(false)
  const [isScreenReady, setIsScreenReady] = useState(false)

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

  const createCipher = async () => {
    setIsLoading(true)
    const cipher = newCipher()
    cipher.name = 'test 123'
    const cipherEnc = await cipherService.encrypt(cipher)
    const data = new CipherRequest(cipherEnc)
    const res = await cipherStore.createCipher(data)
    console.log(res)
    setIsLoading(false)
  }

  const newCipher = () => {
    const cipher = new CipherView()
    cipher.organizationId = null
    cipher.type = CipherType.Login
    cipher.login = new LoginView()
    cipher.login.uris = [new LoginUriView]
    cipher.card = new CardView()
    cipher.identity = new IdentityView()
    cipher.secureNote = new SecureNoteView()
    cipher.secureNote.type = SecureNoteType.Generic
    cipher.folderId = null
    cipher.collectionIds = []
    return cipher
  }

  // ------------ COMPONENTS -------------------
  const header = (
    <Header
      showLogo
      right={(
        <View 
          style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
            justifyContent: 'space-between',
            maxWidth: 50
          }]}
        >
          <Button preset="link">
            <Icon 
              name="sliders"
              size={19} 
              color={color.title} 
            />
          </Button>
          
          <Button preset="link">
            <Icon 
              name="plus"
              size={18} 
              color={color.title} 
            />
          </Button>
        </View>
      )}
    >
      <View style={{ marginTop: 15 }}>
        <Input
          size="xs"
          placeholder="Search"
          style={{ 
            backgroundColor: color.block, 
            paddingBottom: 5,
            paddingTop: 5 
          }}
          InputRightElement={
            <Button
              preset="link"
              style={{ paddingRight: 15 }}
            >
              <Icon 
                name="search"
                size={16} 
                color={color.text} 
              />
            </Button>
          }
        />
      </View>
    </Header>
  )

  // useEffect(() => {
  //   if (!isScreenReady) {
  //     getCiphers()
  //     setIsScreenReady(true)
  //   }
  // }, [isScreenReady])

  return (
    <Layout
      isContentLoading={isLoading}
      header={header}
      borderBottom
    >
    </Layout>
  )
})
