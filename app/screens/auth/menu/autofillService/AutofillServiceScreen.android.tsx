/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react'
import { useNavigation } from '@react-navigation/native'
import { NativeModules, Image, View, TouchableOpacity, AppState } from 'react-native'
import RNAndroidSettingsTool from 'react-native-android-settings-tool'
import { getApiLevel, getManufacturer } from 'react-native-device-info'
import * as Animatable from 'react-native-animatable'
import { AutofillServiceEnabled } from 'app/utils/autofillHelper'
import Accordion from 'react-native-collapsible/Accordion'
import { Button, Header, Icon, Screen, Text } from 'app/components/cores'
import { useTheme } from 'app/services/context'
import { translate } from 'app/i18n'

const HINT = require('assets/images/autofill/androidHint.png')
const PER = require('assets/images/autofill/otherXiaomiPermission.png')
const ACTIVE = require('assets/images/autofill/autofillActive.png')

export const AutofillServiceScreen = function AutofillServiceScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()

  const { RNManufacturerSettings } = NativeModules

  const [enabled, setEnabled] = useState(false)
  const [activeSections, setActiveSections] = useState([])
  const [contents, setContent] = useState([])
  const [api, setApi] = useState(0)
  const [manufacturer, setManufacturer] = useState('')

  const mounted = async () => {
    const res = await getApiLevel()
    const manufacturer = await getManufacturer()
    setManufacturer(manufacturer.toLowerCase())
    setApi(res)
  }

  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)

  // ---------------------------EFFECT-----------------------
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppStateVisible(nextAppState)
    })
  }, [])

  useEffect(() => {
    mounted()
  }, [])

  useEffect(() => {
    AutofillServiceEnabled((isActived) => {
      setEnabled(isActived)
    })
  }, [appStateVisible])

  useEffect(() => {
    const contents = [
      {
        title: translate('autofill_service.android.android_autofill.name'),
        header: translate('autofill_service.android.android_autofill.header'),
        desc: translate('autofill_service.android.android_autofill.desc'),
        image: HINT,
        action: () => {
          RNAndroidSettingsTool.ACTION_REQUEST_SET_AUTOFILL_SERVICE('packge:com.cystack.locker')
        },
        disabled: api < 26,
        border: false,
      },
    ]

    if (manufacturer === 'xiaomi') {
      contents.unshift({
        title: translate('autofill_service.android.other_permission.name_xiaomi'),
        header: translate('autofill_service.android.other_permission.header'),
        desc: translate('autofill_service.android.other_permission.desc'),
        image: PER,
        action: () => {
          RNManufacturerSettings.XIAOMI_APP_PERM_EDITOR()
        },
        disabled: api < 26,
        border: true,
      })
    } else {
      setActiveSections(contents)
    }

    setContent(contents)
  }, [manufacturer, api])

  const setSections = (sections) => {
    // setting up a active section state
    setActiveSections(sections.includes(undefined) ? [] : sections)
  }

  const renderHeader = (section, _, isActive) => {
    // Accordion Header view
    return (
      <View
        style={{
          borderBottomColor: colors.border,
          borderBottomWidth: section.border && !isActive ? 1 : 0,
          justifyContent: 'space-between',
          paddingVertical: 16,
          paddingHorizontal: 20,
          backgroundColor: colors.background,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View style={{ paddingRight: 15 }}>
          <View
            style={{
              flexWrap: 'wrap',
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 3,
            }}
          >
            <Text text={section.title} style={{ marginRight: section.disabled ? 7 : 0 }} />
            {section.disabled && (
              <Text
                text={`(${translate('error.not_supported')})`}
                style={{ color: colors.error }}
              />
            )}
          </View>
        </View>
        <Icon icon="caret-right" size={18} />
      </View>
    )
  }

  const renderContent = (section, _, isActive) => {
    // Accordion Content view
    return (
      <Animatable.View
        duration={200}
        style={{
          padding: 20,
          marginBottom: 16,
          backgroundColor: colors.background,
        }}
        transition="backgroundColor"
      >
        <AutofillServiceRender content={section} />
        {!enabled && (
          <Button
            onPress={section.action}
            style={{ marginTop: 16 }}
            text={translate('autofill_service.android.btn')}
          />
        )}
      </Animatable.View>
    )
  }

  const AutofillServiceRender = ({ content }) => {
    return (
      <View style={{ justifyContent: 'center', flex: 1 }}>
        {enabled && (
          <View style={{ alignItems: 'center' }}>
            <Image source={ACTIVE} style={{ width: 335, height: 215 }}></Image>
            <View style={{ marginTop: 24 }}>
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
          <View style={{ alignItems: 'center' }}>
            <Text preset="bold" text={content.header} style={{ marginBottom: 12 }} />

            <Image
              source={content.image}
              style={{
                width: 335,
                height: 227,
                marginVertical: 16,
              }}
            />

            <Text text={content.desc} />
          </View>
        )}
      </View>
    )
  }
  // ----------------- RENDER --------------------

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
                RNAndroidSettingsTool.ACTION_REQUEST_SET_AUTOFILL_SERVICE(
                  'packge:com.cystack.locker'
                )
              }
            }}
          ></Button>
        </View>
      }
    >
      {contents.length > 1 && (
        <Accordion
          activeSections={activeSections}
          sections={contents}
          touchableComponent={TouchableOpacity}
          renderHeader={renderHeader}
          renderContent={renderContent}
          duration={200}
          onChange={setSections}
        />
      )}
      {contents.length === 1 && <AutofillServiceRender content={contents[0]} />}
    </Screen>
  )
}
