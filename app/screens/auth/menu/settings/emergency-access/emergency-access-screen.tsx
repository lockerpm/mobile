import React from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SettingsItem, SectionWrapperItem } from "../settings-item"
import { useMixins } from "../../../../../services/mixins"
import { createStackNavigator } from "@react-navigation/stack"
import { YourTrustedContactScreen } from "./your-trusted/your-trusted-screen"
import { ContactsTrustedYouScreen } from "./trusted-you/trusted-you-contact-screen"


const EmergencyAccessScreen = observer(function EmergencyAccessScreen() {
  const navigation = useNavigation()
  const { translate, color } = useMixins()

  // ----------------------- PARAMS -----------------------

  // ----------------------- METHODS -----------------------

  // ----------------------- RENDER -----------------------

  return (
    <Layout
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={"Emergency access"}
          right={(<View style={{ width: 30 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <SectionWrapperItem title={"Pending emergency request".toUpperCase()}>
        {/* Push notifications */}
        <SettingsItem
          name={"Your trusted contacts"}
          action={() => navigation.navigate("yourTrustedContact")}
        />
        {/* Push notifications end */}

        {/* Email */}
        <SettingsItem
          name={"Contacts that trusted you"}
          action={() => navigation.navigate("contactsTrustedYou")}
        />
        {/* Email end */}
      </SectionWrapperItem>
    </Layout>
  )
})


export type HealthParamList = {
  emergencyAccess: undefined
  yourTrustedContact: undefined
  contactsTrustedYou: undefined
}

const Stack = createStackNavigator<HealthParamList>()

export const EmergencyAccessNavigator = observer(() => {

  // ------------------ RENDER --------------------

  return (
    <Stack.Navigator
      initialRouteName="emergencyAccess"
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="emergencyAccess" component={EmergencyAccessScreen} />
      <Stack.Screen name="yourTrustedContact" component={YourTrustedContactScreen} />
      <Stack.Screen name="contactsTrustedYou" component={ContactsTrustedYouScreen} />
    </Stack.Navigator>
  )
})
