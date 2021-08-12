import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { 
  BrowseListScreen , FoldersScreen, CardsScreen, PasswordsScreen, 
  NotesScreen, IdentitiesScreen, SharesScreen, TrashScreen
} from "../../screens"

const Stack = createStackNavigator()

export const BrowseNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="browseList"
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="browseList" component={BrowseListScreen} />
      <Stack.Screen name="folders" component={FoldersScreen} />
      <Stack.Screen name="cards" component={CardsScreen} />
      <Stack.Screen name="passwords" component={PasswordsScreen} />
      <Stack.Screen name="notes" component={NotesScreen} />
      <Stack.Screen name="identities" component={IdentitiesScreen} />
      <Stack.Screen name="shares" component={SharesScreen} />
      <Stack.Screen name="trash" component={TrashScreen} />
    </Stack.Navigator>
  )
}
