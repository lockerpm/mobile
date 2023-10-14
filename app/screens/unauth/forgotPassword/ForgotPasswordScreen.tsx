import React, { FC, useState } from 'react'
import { RootStackScreenProps } from 'app/navigators'
import { Button, Header, Screen, TextInput } from 'app/components/cores'

import { useHelper } from 'app/services/hook'
import { useStores } from 'app/models'
import { ChangePassword } from './ChangePassword'
import { MethodSelectSheet } from './methodSelecBottomSheet/BottomSheetModal'
import Animated, { SlideInUp } from 'react-native-reanimated'
import { View } from 'react-native'
import { observer } from 'mobx-react-lite'

export const ForgotPasswordScreen: FC<RootStackScreenProps<'forgotPassword'>> = observer(
  (props) => {
    const navigation = props.navigation
    const { user } = useStores()
    const { notify, notifyApiError, translate } = useHelper()
    // ------------------------------ PARAMS -------------------------------

    const [isError, setIsError] = useState(false)
    const [username, setUsername] = useState('')

    const [methods, setMethods] = useState([])

    const [token, setToken] = useState('')

    const [isLoading, setIsLoading] = useState(false)
    const [showMethodSelectSheet, setShowMethodSelectSheet] = useState(false)

    // ------------------------------ METHODS -------------------------------

    const handleRequest = async () => {
      setIsLoading(true)
      const res = await user.recoverAccount(username)
      setIsLoading(false)
      if (res.kind !== 'ok') {
        if (res.kind === 'rejected') {
          notifyApiError(res)
          return
        }
        setIsError(true)
        notify('error', translate('error.no_associated_account'))
      } else {
        setMethods(res.data)
        setShowMethodSelectSheet(true)
      }
    }

    // ------------------------------ RENDER -------------------------------

    return (
      <Screen
        safeAreaEdges={['bottom']}
        padding
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={() => navigation.goBack()}
            title={
              !token
                ? translate('forgot_password.title')
                : translate('forgot_password.set_new_password')
            }
          />
        }
      >
        {!token && (
          <View>
            <TextInput
              animated
              isError={isError}
              label={translate('forgot_password.username_or_email')}
              value={username}
              onChangeText={setUsername}
              onSubmitEditing={handleRequest}
            />

            <Button
              loading={isLoading}
              disabled={isLoading || !username}
              text={translate('forgot_password.request')}
              onPress={handleRequest}
              style={{
                width: '100%',
                marginTop: 16,
              }}
            />
          </View>
        )}

        {!!token && (
          <Animated.View entering={SlideInUp} style={{ marginTop: 12 }}>
            <ChangePassword
              token={token}
              nextStep={() => {
                navigation.navigate('login')
              }}
            />
          </Animated.View>
        )}

        <MethodSelectSheet
          methods={methods}
          setToken={setToken}
          isOpen={showMethodSelectSheet}
          onClose={() => {
            setShowMethodSelectSheet(false)
          }}
        />
      </Screen>
    )
  }
)
