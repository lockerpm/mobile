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
  SharedWithYouScreen,
  ShareMultipleScreen,
  SharesHomeScreen,
  YourShareScreen,
} from "./screens"
import { ShareActionsModalScreen } from "./screens/modal"

const Stack = createStackNavigator<ShareRoute>()

export const ShareStack = observer(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="shareActionsModal"
        component={ShareActionsModalScreen}
        options={{
          presentation: "transparentModal",
        }}
      />
      <Stack.Screen name="sharesHome" component={SharesHomeScreen} />
      <Stack.Screen name="yourShare" component={YourShareScreen} />

      <Stack.Screen name="sharedWithYou" component={SharedWithYouScreen} />

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
