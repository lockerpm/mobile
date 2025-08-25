import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import {
  SharedWithYouScreen,
  SharesHomeScreen,
  YourShareScreen,
  QuickShareScreen,
  QuickShareDetailScreen,
  QuickSharesActionsModalScreen,
  QuickSharesScreen,
  QuickSharesAddScreen,
  NormalSharesScreen,
  ManageSharedMemberScreen,
  ManageShareMemberModalScreen,
  ConfirmYourShareModalScreen,
  PendingSharedCipherModalScreen,
  FolderSharesScreen,
  ManageFolderSharedMemberScreen,
  ManageFolderShareMemberModalScreen,
  EditShareMemberPermissionModalScreen,
} from "./screens"
import { modalScreenOptions, ShareRoute } from "@/navigators"

const Stack = createNativeStackNavigator<ShareRoute>()

export const ShareStack = observer(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Group screenOptions={modalScreenOptions}>
        <Stack.Screen name="pendingSharedCipherModal" component={PendingSharedCipherModalScreen} />
        <Stack.Screen name="confirmYourShareModal" component={ConfirmYourShareModalScreen} />
        <Stack.Screen name="quickSharesActionsModal" component={QuickSharesActionsModalScreen} />
        <Stack.Screen name="manageSharedMemberModal" component={ManageShareMemberModalScreen} />
        <Stack.Screen
          name="manageFolderSharedMemberModal"
          component={ManageFolderShareMemberModalScreen}
        />
        <Stack.Screen
          name="editShareMemberPermissionModal"
          component={EditShareMemberPermissionModalScreen}
        />
      </Stack.Group>
      <Stack.Screen name="sharesHome" component={SharesHomeScreen} />
      <Stack.Screen name="sharedWithYouCipherList" component={SharedWithYouScreen} />
      <Stack.Screen name="yourShareCipherList" component={YourShareScreen} />
      <Stack.Screen name="quickShareCipherList" component={QuickShareScreen} />
      <Stack.Screen name="quickShareCipherDetail" component={QuickShareDetailScreen} />
      <Stack.Screen name="quickShares" component={QuickSharesScreen} />
      <Stack.Screen name="quickSharesSelectCipher" component={QuickSharesAddScreen} />
      <Stack.Screen name="normalShare" component={NormalSharesScreen} />
      <Stack.Screen name="manageSharedMember" component={ManageSharedMemberScreen} />
      <Stack.Screen name="folderShare" component={FolderSharesScreen} />
      <Stack.Screen name="manageFolderSharedMember" component={ManageFolderSharedMemberScreen} />
    </Stack.Navigator>
  )
})
