import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import { InviteToFamilyRoute, modalScreenOptions } from "app/navigators"
import { DeleteMemberModalScreen, InviteMemberScreen, ManageMemberScreen } from "./screens"

const Stack = createNativeStackNavigator<InviteToFamilyRoute>()

export const InviteToFamilyStack = observer(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="deleteMember"
        component={DeleteMemberModalScreen}
        options={modalScreenOptions}
      />
      <Stack.Screen name="manageMember" component={ManageMemberScreen} />
      <Stack.Screen name="inviteMember" component={InviteMemberScreen} />
    </Stack.Navigator>
  )
})
