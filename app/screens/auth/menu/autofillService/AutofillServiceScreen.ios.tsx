/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native'
import { View, Image, Linking, AppState } from 'react-native'
import { AutofillServiceEnabled } from 'app/utils/autofillHelper'
import { Step } from './EnableAutofillStep'
import { Button, Header, Screen, Text } from 'app/components/cores'
import { translate } from 'app/i18n'

const ACTIVE = require('assets/images/autofill/autofillActive.png')
const IOS_HINT = require('assets/images/autofill/IosHint.png')
const Keyboard = require('assets/images/icons/autofill/keyboard.png')
const Switch = require('assets/images/icons/autofill/switch.png')
const Key = require('assets/images/icons/autofill/key.png')
const Locker = require('assets/images/icons/autofill/locker.png')

export const AutofillServiceScreen = observer(function AutofillServiceScreen() {
  const navigation = useNavigation()

  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)
  const [enabled, setEnabled] = useState(false)

  // ---------------------------EFFECT-----------------------
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppStateVisible(nextAppState)
    })
  }, [])

  useEffect(() => {
    AutofillServiceEnabled((isActived) => {
      setEnabled(isActived)
    })
  }, [appStateVisible])

  return (
    <Screen
      header={
        !enabled ? (
          <Header
            leftIcon="arrow-left"
            onLeftPress={() => {
              navigation.goBack()
            }}
            title={translate('settings.autofill_service')}
          />
        ) : null
      }
      footer={
        <View>
          <Button
            text={enabled ? translate('common.ok') : translate('common.open_settings')}
            onPress={() => {
              if (enabled) {
                navigation.navigate('mainTab', { screen: 'homeTab' })
              } else {
                Linking.canOpenURL('app-settings:').then((supported) => {
                  if (supported) {
                    Linking.openURL('App-prefs:root=General&path=Passwords')
                  }
                })
              }
            }}
          ></Button>
        </View>
      }
    >
      {enabled && (
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Image source={ACTIVE} style={{ width: 335, height: 215 }}></Image>
          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <Text
              preset="bold"
              size="xl"
              text={translate('autofill_service.activated.title')}
              style={{ textAlign: 'center' }}
            />
            <Text
              text={translate('autofill_service.activated.content')}
              style={{ marginTop: 24, textAlign: 'center' }}
            />
          </View>
        </View>
      )}
      {!enabled && (
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Text preset="bold" text="Enable Password Autofill" />

          <Text
            text="Get your Locker information right where you need it, from the keyboard"
            style={{
              marginTop: 12,
              marginBottom: 15,
              textAlign: 'center',
            }}
          />
          <Image source={IOS_HINT} style={{ width: 335, height: 215 }}></Image>
          <View>
            <Text
              text="Step-by-step, in Settings → Passwords:"
              style={{
                marginTop: 25,
                marginBottom: 10,
              }}
            />
            <Step img={Keyboard} text="Tap on Autofill Passwords" />
            <Step img={Switch} text="Enable Autofill Passwords" />
            <Step img={Key} text="Important! Tap to disable Keychain" />
            <Step img={Locker} text="Tap to enable Locker" />
          </View>
        </View>
      )}
    </Screen>
  )
})
