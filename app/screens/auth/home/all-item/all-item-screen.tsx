import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Screen, Text } from "../../../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../../../theme"
import { useCoreService } from "../../../../services/core-service"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

export const AllItemScreen = observer(function AllItemScreen() {
  // const { someStore, anotherStore } = useStores()
  // const navigation = useNavigation()
  const { searchService } = useCoreService()

  const getCiphers = async () => {
    try {
      const searchText = null
      const searchFilter = null
      const res = await searchService.searchCiphers(searchText, [searchFilter], null)
      console.log(res)
    } catch (e) {
      console.log('main error')
      console.log(e)
    }
  }

  useEffect(() => {
    getCiphers()
  }, [])

  return (
    <Screen style={ROOT} preset="scroll">
      <Text preset="header" text="All item" />
    </Screen>
  )
})
