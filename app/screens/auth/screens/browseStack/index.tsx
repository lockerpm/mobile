import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
  CipherDetailScreen,
  CipherEditScreen,
  AttachmentScreen,
  PasswordHistoryScreen,
  CipherListScreen,
  FolderListScreen,
  CipherEditHelperModalScreen,
  FolderActionsModalScreen,
  FolderSelectScreen,
  ShareStack,
  OtpSelectScreen,
} from "./screens"
import { observer } from "mobx-react-lite"
import { BrowseRoute, modalScreenOptions } from "app/navigators"

const Stack = createNativeStackNavigator<BrowseRoute>()

export const BrowseStack = observer(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Group screenOptions={modalScreenOptions}>
        <Stack.Screen name="cipherEditHelperModal" component={CipherEditHelperModalScreen} />
        <Stack.Screen name="folderActionModal" component={FolderActionsModalScreen} />
      </Stack.Group>

      <Stack.Screen name="attachment" component={AttachmentScreen} />
      <Stack.Screen name="passwordsHistory" component={PasswordHistoryScreen} />
      <Stack.Screen name="cipherList" component={CipherListScreen} />
      <Stack.Screen name="cipherEdit" component={CipherEditScreen} />
      <Stack.Screen name="cipherDetail" component={CipherDetailScreen} />
      <Stack.Screen name="folderList" component={FolderListScreen} />
      <Stack.Screen name="folderSelect" component={FolderSelectScreen} />
      <Stack.Screen name="otpSelect" component={OtpSelectScreen} />
      <Stack.Screen name="shareStack" component={ShareStack} />
    </Stack.Navigator>
  )
})
