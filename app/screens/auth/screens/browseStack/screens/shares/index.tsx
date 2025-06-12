import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import { ShareRoute } from "app/navigators"
import {
  FolderSharedUsersManagementScreen,
  NormalSharesScreen,
  QuickShareItemsScreen,
  QuickSharesDetailScreen,
  QuickSharesScreen,
  SharedItemsScreen,
  ShareItemsScreen,
  ShareMultipleScreen,
  SharesHomeScreen,
} from "./screens"

const Stack = createStackNavigator<ShareRoute>()

export const ShareStack = observer(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="sharesHome" component={SharesHomeScreen} />
      <Stack.Screen name="sharedItems" component={SharedItemsScreen} />
      <Stack.Screen name="shareItems" component={ShareItemsScreen} />
      <Stack.Screen name="quickShareItems" component={QuickShareItemsScreen} />
      <Stack.Screen
        name="normalShares"
        component={NormalSharesScreen}
        initialParams={{ ciphers: [] }}
      />
      <Stack.Screen name="quickShares" component={QuickSharesScreen} />
      <Stack.Screen name="quickShareItemsDetail" component={QuickSharesDetailScreen} />
      <Stack.Screen name="shareFolder" component={FolderSharedUsersManagementScreen} />
      <Stack.Screen name="shareMultiple" component={ShareMultipleScreen} />
    </Stack.Navigator>
  )
})
