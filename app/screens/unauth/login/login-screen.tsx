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
import { useStores } from "../../../models"


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
  const { user } = useStores()
  const { translate } = useMixins()

  // ------------------------------ PARAMS -------------------------------

  const [isScreenLoading, setIsScreenLoading] = useState(false)
  const [index, setIndex] = useState(0)
  const [routes] = useState([
    { key: 'default', title: 'default' },
    { key: 'methodSelection', title: 'methodSelection' },
    { key: 'otp', title: 'otp' },
  ])
  const [credential, setCredential] = useState({
    username: '',
    password: '',
    methods: []
  })
  const [method, setMethod] = useState('')
  const [partialEmail, setPartialEamil] = useState('')

  // ------------------------------ METHODS -------------------------------

  const onLoggedIn = async () => {
    setIsScreenLoading(true)
    const [userRes, userPwRes] = await Promise.all([
      user.getUser(),
      user.getUserPw()
    ])
    setIsScreenLoading(false)
    if (userRes.kind === 'ok' && userPwRes.kind === 'ok') {
      if (user.is_pwd_manager) {
        navigation.navigate('lock')
      } else {
        navigation.navigate('createMasterPassword')
      }
    }
  }

  // ------------------------------ RENDER -------------------------------

  const renderScene = SceneMap({
    default: () => (
      <ScrollView contentContainerStyle={containerStyle}>
        <DefaultLogin
          handleForgot={() => navigation.navigate('forgotPassword')}
          onLoggedIn={onLoggedIn}
          nextStep={(username: string, password: string, methods: { type: string, data: any }[]) => {
            setCredential({ username, password, methods })
            setIndex(1)
          }}
        />
      </ScrollView>
    ),
    methodSelection: () => (
      <ScrollView contentContainerStyle={containerStyle}>
        <MethodSelection
          goBack={() => setIndex(0)}
          methods={credential.methods}
          onSelect={(type: string, data: any) => {
            setMethod(type)
            setPartialEamil(data)
            setIndex(2)
          }}
          username={credential.username}
          password={credential.password}
        />
      </ScrollView>
    ),
    otp: () => (
      <ScrollView contentContainerStyle={containerStyle}>
        <Otp
          goBack={() => setIndex(1)}
          method={method}
          email={partialEmail}
          username={credential.username}
          password={credential.password}
          onLoggedIn={onLoggedIn}
        />
      </ScrollView>
    )
  })

  return (
    <Layout
      noScroll
      isOverlayLoading={isScreenLoading}
      footer={(
        <View
          style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
            marginTop: 12,
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
