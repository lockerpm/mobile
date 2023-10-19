import React, { FC, useEffect, useState } from 'react'
import { View } from 'react-native'
import { BASE_URL } from 'app/config/constants'
import { RootStackScreenProps } from 'app/navigators'
import { useStores } from 'app/models'
import { api } from 'app/services/api'
import { LoginForm } from './LoginForm'
import { TwoFAAuthenSheet } from './2faBottomSheet/BottomSheetModal'
import { Screen, Text } from 'app/components/cores'
import { useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { observer } from 'mobx-react-lite'

export const LoginScreen: FC<RootStackScreenProps<'login'>> = observer((props) => {
  const navigation = props.navigation
  const { colors } = useTheme()
  const { user } = useStores()
  const { notify, translate } = useHelper()

  // ------------------------------ PARAMS -------------------------------

  const [credential, setCredential] = useState({
    username: '',
    password: '',
    methods: [],
  })
  const [isShow2FASheet, setIsShow2FASheet] = useState(false)

  // ------------------------------ METHODS -------------------------------

  const onLoggedIn = async (_newUser?: boolean, _token?: string) => {
    const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])
    if (userRes.kind === 'ok' && userPwRes.kind === 'ok') {
      if (user.is_pwd_manager) {
        navigation.replace('lock')
      } else {
        navigation.replace('createMasterPassword')
      }
    } else {
      notify('error', translate('error.login_failed'))
    }
  }

  const nextStep = (username: string, password: string, methods: { type: string; data: any }[]) => {
    setCredential({ username, password, methods })
    setIsShow2FASheet(true)
  }

  const handleForgot = () => navigation.navigate('forgotPassword')

  // -------------- EFFECT ------------------

  useEffect(() => {
    user.setOnPremiseUser(false)
    api.apisauce.setBaseURL(BASE_URL)
  }, [])

  useEffect(() => {
    const handleBack = (e) => {
      if (!['POP', 'GO_BACK'].includes(e.data.action.type)) {
        navigation.dispatch(e.data.action)
        return
      }

      e.preventDefault()
      navigation.navigate('login')
    }

    navigation.addListener('beforeRemove', handleBack)

    return () => {
      navigation.removeListener('beforeRemove', handleBack)
    }
  }, [navigation])

  // ------------------------------ RENDER -------------------------------

  return (
    <Screen
      KeyboardAvoidingViewProps={{
        enabled: false,
      }}
      padding
      safeAreaEdges={['top', 'bottom']}
      contentContainerStyle={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <LoginForm handleForgot={handleForgot} onLoggedIn={onLoggedIn} nextStep={nextStep} />

        <TwoFAAuthenSheet
          credential={credential}
          isOpen={isShow2FASheet}
          onClose={() => {
            setIsShow2FASheet(false)
          }}
          onLoggedIn={onLoggedIn}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 12,
          }}
        >
          <Text
            text={translate('login.no_account')}
            style={{
              marginRight: 12,
            }}
          />
          <Text
            color={colors.primary}
            text={translate('common.sign_up')}
            onPress={() => navigation.navigate('signup')}
          />
        </View>
      </View>
    </Screen>
  )
})
