import React, { useState } from "react"
import { View, ViewStyle, ScrollView } from "react-native"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { Layout, Text, Button } from "../../../components"
import { useMixins } from "../../../services/mixins"
import { commonStyles } from "../../../theme"
import { TabView, SceneMap } from 'react-native-tab-view'
import { DefaultLogin } from "./default"
import { MethodSelection } from "./method-selection"
import { Otp } from "./otp"


const containerStyle: ViewStyle = {
  justifyContent: "flex-start",
  alignItems: "stretch",
  paddingTop: 16,
  paddingBottom: 32,
  paddingHorizontal: 20,
  minHeight: '100%'
}


export const LoginScreen = observer(function LoginScreen() {
  const navigation = useNavigation()
  const { translate } = useMixins()

  // ------------------------------ PARAMS -------------------------------

  const [index, setIndex] = useState(0)
  const [routes] = useState([
    { key: 'default', title: 'default' },
    { key: 'methodSelection', title: 'methodSelection' },
    { key: 'otp', title: 'otp' },
  ])
  const renderScene = SceneMap({
    default: () => (
      <ScrollView contentContainerStyle={containerStyle}>
        <DefaultLogin navigation={navigation} />
      </ScrollView>
    ),
    methodSelection: () => (
      <ScrollView contentContainerStyle={containerStyle}>
        <MethodSelection
          goBack={() => setIndex(0)}
          methods={[{"type":"mail","data":"du***@cystack.net"},{"type":"smart_otp","data":{}}]}
          onSelect={() => {}}
        />
      </ScrollView>
    ),
    otp: () => (
      <ScrollView contentContainerStyle={containerStyle}>
        <Otp
          goBack={() => setIndex(1)}
          method={'mail'}
          email={'du***@cystack.net'}
          onSubmit={async () => { return true }}
        />
      </ScrollView>
    )
  })

  // ------------------------------ RENDER -------------------------------

  return (
    <Layout
      noScroll
      footer={(
        <View
          style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
            marginTop: 12,
            marginBottom: 24,
            justifyContent: 'center'
          }]}
        >
          <Text
            text={translate("login.no_account")}
            style={{
              marginRight: 8,
            }}
          />
          <Button
            preset="link"
            text={translate("common.sign_up")}
            onPress={() => navigation.navigate("signup")}
          />
        </View>
      )}
    >
      <View style={{ height: '100%' }}>
        <TabView
          lazy
          swipeEnabled={false}
          renderTabBar={() => null}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
        />
      </View>
    </Layout>
  )
})
