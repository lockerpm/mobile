import React, { useState } from "react"
import { View, ViewStyle, ScrollView } from "react-native"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { Layout } from "../../../components"
import { TabView, SceneMap } from 'react-native-tab-view'
import { Step1 } from "./step1"
import { Step2 } from "./step2"


const containerStyle: ViewStyle = {
  justifyContent: "flex-start",
  alignItems: "stretch",
  paddingTop: 16,
  paddingBottom: 32,
  paddingHorizontal: 20,
  minHeight: '100%'
}


export const ForgotPasswordScreen = observer(function ForgotPasswordScreen() {
  const navigation = useNavigation()

  // ------------------------------ PARAMS -------------------------------

  const [index, setIndex] = useState(0)
  const [methods, setMethods] = useState([])
  const [routes] = useState([
    { key: 'step1', title: 'step 1' },
    { key: 'step2', title: 'step 2' }
  ])
  const [method, setMethod] = useState('')
  const [username, setUsername] = useState('')
  const [token, setToken] = useState('')


  // ------------------------------ METHODS -------------------------------

  // ------------------------------ RENDER -------------------------------

  const renderScene = SceneMap({
    step1: () => (
      <ScrollView contentContainerStyle={containerStyle}>
        <Step1
          nextStep={(methods: { type: string, data: any }[]) => {
            setMethods(methods)
            setIndex(1)
          }}
          goBack={() => navigation.goBack()}
        />
      </ScrollView>
    ),
    step2: () => (
      <ScrollView contentContainerStyle={containerStyle}>
        <Step2
          goBack={() => setIndex(0)}
          methods={methods}
          onSelect={(type: string, data: any) => {
            setMethod(type)
            setUsername(data[0])
          }}
        />
      </ScrollView>
    )
  })

  return (
    <Layout
      noScroll
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
