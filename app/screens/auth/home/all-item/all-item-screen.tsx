import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Loading, Screen, Text, Button } from "../../../../components"
// import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../../models"
import { color } from "../../../../theme"
import { useCoreService } from "../../../../services/core-service"
import { CardView, CipherView, IdentityView, LoginUriView, LoginView, SecureNoteView } from "../../../../../core/models/view"
import { CipherType, SecureNoteType } from "../../../../../core/enums"
import { CipherRequest } from "../../../../../core/models/request/cipherRequest"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

export const AllItemScreen = observer(function AllItemScreen() {
  const { cipherStore } = useStores()
  // const navigation = useNavigation()
  const { searchService, cipherService } = useCoreService()
  const [isLoading, setIsLoading] = useState(false)
  const [isScreenReady, setIsScreenReady] = useState(false)

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

  useEffect(() => {
    if (!isScreenReady) {
      getCiphers()
      setIsScreenReady(true)
    }
  }, [isScreenReady])

  return isLoading ? <Loading /> : (
    <Screen style={ROOT} preset="scroll">
      <Text preset="header" text="All item" />
      <Button
        text="Test create cipher"
        onPress={createCipher}
      />
    </Screen>
  )
})
