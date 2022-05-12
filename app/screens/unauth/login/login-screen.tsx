import React, { useEffect, useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { Layout, Text, Button } from "../../../components"
import { useMixins } from "../../../services/mixins"
import { commonStyles } from "../../../theme"
import { DefaultLogin } from "./default"
import { MethodSelection } from "./method-selection"
import { Otp } from "./otp"
import { useStores } from "../../../models"

export const LoginScreen = observer(() => {
  const navigation = useNavigation()
  const { user } = useStores()
  const { translate } = useMixins()
  // ------------------------------ PARAMS -------------------------------

  const [isScreenLoading, setIsScreenLoading] = useState(false)
  const [index, setIndex] = useState(0)
  const [credential, setCredential] = useState({
    username: '',
    password: '',
    methods: []
  })
  const [method, setMethod] = useState('')
  const [partialEmail, setPartialEamil] = useState('')

  // ------------------------------ METHODS -------------------------------

  const onLoggedIn = async () => {
    setIndex(0)
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

  // -------------- EFFECT ------------------

  useEffect(() => {
    const handleBack = (e) => {
      if (!['POP', 'GO_BACK'].includes(e.data.action.type)) {
        navigation.dispatch(e.data.action)
        return
      }

      e.preventDefault()
      navigation.navigate('onBoarding')
    }

    navigation.addListener('beforeRemove', handleBack)

    return () => {
      navigation.removeListener('beforeRemove', handleBack)
    }
  }, [navigation])

  // ------------------------------ RENDER -------------------------------

  return (
    <Layout
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
      {
        index === 0 && (
          <DefaultLogin
            handleForgot={() => navigation.navigate('forgotPassword')}
            onLoggedIn={onLoggedIn}
            nextStep={(username: string, password: string, methods: { type: string, data: any }[]) => {
              setCredential({ username, password, methods })
              setIndex(1)
            }}
          />
        )
      }
      {
        index === 1 && (
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
        )
      }
      {
        index === 2 && (
          <Otp
            goBack={() => setIndex(1)}
            method={method}
            email={partialEmail}
            username={credential.username}
            password={credential.password}
            onLoggedIn={onLoggedIn}
          />
        )
      }
    </Layout>
  )
})
