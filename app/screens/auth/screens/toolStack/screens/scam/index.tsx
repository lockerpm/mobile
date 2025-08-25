import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import {
  ScamHomeScreen,
  ScamLookupScreen,
  ScamLookupResultScreen,
  ScamMyReportListScreen,
  ScamReportScreen,
} from "./screens"
import { ScamRoute } from "@/navigators"

const Stack = createNativeStackNavigator<ScamRoute>()

export const ScamStack = observer(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="scamList" component={ScamHomeScreen} />
      <Stack.Screen name="lookup" component={ScamLookupScreen} />
      <Stack.Screen name="lookupResult" component={ScamLookupResultScreen} />
      <Stack.Screen name="myReportList" component={ScamMyReportListScreen} />
      <Stack.Screen
        name="report"
        component={ScamReportScreen}
        initialParams={{
          phoneNumber: "",
        }}
      />
    </Stack.Navigator>
  )
})
