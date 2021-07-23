import React from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Screen, Text, Button } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../../../theme"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

export const BrowseListScreen = observer(function BrowseListScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation()

  return (
    <Screen style={ROOT} preset="scroll">
      <Text preset="header" text="Browse list" />
      <Button
        text="Folder"
        onPress={() => navigation.navigate('folders')}
      />
      <Button
        text="Cards"
        onPress={() => navigation.navigate('cards')}
      />
      <Button
        text="Passwords"
        onPress={() => navigation.navigate('passwords')}
      />
      <Button
        text="Notes"
        onPress={() => navigation.navigate('note')}
      />
      <Button
        text="Identities"
        onPress={() => navigation.navigate('identities')}
      />
      <Button
        text="Shares"
        onPress={() => navigation.navigate('shares')}
      />
      <Button
        text="Trash"
        onPress={() => navigation.navigate('trash')}
      />
    </Screen>
  )
})
