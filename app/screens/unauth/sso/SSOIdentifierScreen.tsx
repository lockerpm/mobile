import { observer } from 'mobx-react-lite'
import React, { FC, useState } from 'react'
import { useStores } from 'app/models'
import { useHelper } from 'app/services/hook'
import { Text, TextInput, Button, Screen, Header, Logo } from 'app/components/cores'
import { RootStackScreenProps } from 'app/navigators'

export const SSOIdentifierScreen: FC<RootStackScreenProps<'ssoIdentifier'>> = observer((props) => {
  const navigation = props.navigation
  const { user } = useStores()
  const { notifyApiError } = useHelper()

  const [ssoId, setSsoId] = useState('')

  const onSubmit = async () => {
    const res = await user.onPremiseIdentifier(ssoId)
    if (res.kind !== 'ok') {
      notifyApiError(res)
    } else {
      navigation.navigate('ssoLogin', { ...res.data })
    }
  }

  return (
    <Screen
      preset="auto"
      padding
      safeAreaEdges={['bottom']}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
        />
      }
    >
      <Logo
        preset={'default'}
        style={{ height: 80, width: 70, marginBottom: 10, alignSelf: 'center' }}
      />
      <Text
        preset="bold"
        size="xl"
        text="Sign in to your company"
        style={{
          marginBottom: 20,
          textAlign: 'center',
        }}
      />

      <TextInput
        animated
        label={'Enter your SSO Identifier'}
        onChangeText={setSsoId}
        value={ssoId}
        style={{ marginBottom: 12 }}
        // onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
      />

      <Button
        disabled={!ssoId}
        text="Continue"
        onPress={onSubmit}
        style={{ marginTop: 24, marginBottom: 16 }}
      />

      <Text>
        Don't know your SSO Identifier?{' '}
        <Text
          preset="bold"
          onPress={() => {
            navigation.navigate('ssoLogin')
          }}
        >
          Enter your email
        </Text>
      </Text>
      <Text
        preset="label"
        text="Looking to create an SSO Identifier instead?"
        style={{ marginTop: 4 }}
      />
      <Text style={{ marginTop: 4 }}>
        Contact us at{' '}
        <Text preset="bold" style={{ textDecorationLine: 'underline' }}>
          contact@locker.io
        </Text>
      </Text>
    </Screen>
  )
})
