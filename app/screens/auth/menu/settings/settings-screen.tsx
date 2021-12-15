import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, View, Switch } from "react-native"
import { Layout, Text, Header, Select } from "../../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../../theme"
import { useStores } from "../../../../models"
import { SettingsItem } from "./settings-item"
import { useMixins } from "../../../../services/mixins"
import { PrimaryParamList } from "../../../../navigators/main-navigator"
import ReactNativeBiometrics from "react-native-biometrics"
import { AutofillDataType, loadShared, saveShared } from "../../../../utils/keychain"


const SECTION_TITLE: TextStyle = {
  fontSize: fontSize.small,
  marginHorizontal: 20,
  marginBottom: 12,
}

type ScreenProp = RouteProp<PrimaryParamList, 'settings'>;

export const SettingsScreen = observer(function SettingsScreen() {
  const navigation = useNavigation()
  const { user, uiStore } = useStores()
  const { notify, isBiometricAvailable, translate, color } = useMixins()
  const route = useRoute<ScreenProp>()
  const { fromIntro } = route.params

  // ----------------------- PARAMS -----------------------

  const [isLoading, setIsLoading] = useState(false)

  // ----------------------- METHODS -----------------------

  const enableBiometric = async () => {
    setIsLoading(true)
    const available = await isBiometricAvailable()
    setIsLoading(false)

    if (!available) {
      notify('error', translate('error.biometric_not_support'))
      return
    }

    const { success } = await ReactNativeBiometrics.simplePrompt({
      promptMessage: 'Verify FaceID/TouchID'
    })

    if (!success) {
      notify('error', translate('error.biometric_unlock_failed'))
      return
    }

    user.setBiometricUnlock(true)
    
    // Update autofill settings
    await updateAutofillFaceIdSetting(true)

    notify('success', translate('success.biometric_enabled'))
  }

  const updateAutofillFaceIdSetting = async (enabled: boolean) => {
    const credentials = await loadShared()
    if (credentials && credentials.password) {
      const sharedData: AutofillDataType = JSON.parse(credentials.password)
      sharedData.faceIdEnabled = enabled
      await saveShared('autofill', JSON.stringify(sharedData))
    }
  }

  // ----------------------- EFFECT -------------------------

  let isBacking = false
  useEffect(() => {
    const handleBack = (e) => {
      if (!['POP', 'GO_BACK'].includes(e.data.action.type)) {
        navigation.dispatch(e.data.action)
        return
      }
      
      if (isBacking) {
        isBacking = false
        navigation.dispatch(e.data.action)
        return
      }

      e.preventDefault()
      isBacking = true

      if (fromIntro) {
        navigation.navigate('mainTab', { screen: 'homeTab' })
      } else {
        navigation.goBack()
      }
    }

    navigation.addListener('beforeRemove', handleBack)

    return () => {
      navigation.removeListener('beforeRemove', handleBack)
    }
  }, [navigation])

  // ----------------------- RENDER -----------------------

  const settings = {
    language: {
      value: user.language || 'en',
      onChange: (lang: string) => {
        user.setLanguage(lang)
      },
      options: [
        {
          label: 'Tiếng Việt',
          value: 'vi'
        },
        {
          label: 'English',
          value: 'en'
        }
      ]
    },
    theme: {
      value: uiStore.isDark ? 'dark' : 'light',
      onChange: (theme: string) => {
        uiStore.setIsDark(theme === 'dark')
      },
      options: [
        {
          label: translate('settings.light_theme'),
          value: 'light'
        },
        {
          label: translate('settings.dark_theme'),
          value: 'dark'
        }
      ]
    },
    defaultTab: {
      value: user.defaultTab,
      onChange: (defaultTab: string) => {
        user.setDefaultTab(defaultTab)
      },
      options: [
        {
          label: translate('common.home'),
          value: 'homeTab'
        },
        {
          label: translate('common.browse'),
          value: 'browseTab'
        },
        {
          label: translate('authenticator.title'),
          value: 'authenticatorTab'
        },
        {
          label: translate('common.tools'),
          value: 'toolsTab'
        },
        {
          label: translate('common.menu'),
          value: 'menuTab'
        }
      ]
    },
    biometric: {
      value: user.isBiometricUnlock,
      onChage: (isActive: boolean) => {
        if (isActive){
          enableBiometric()
        } else {
          user.setBiometricUnlock(false)
          updateAutofillFaceIdSetting(false)
        }
      }
    },
    timeout: {
      value: user.appTimeout || 0,
      onChange: user.setAppTimeout,
      options: [
        {
          label: `30 ${translate('common.seconds')}`,
          value: 30 * 1000
        },
        {
          label: `1 ${translate('common.minute')}`,
          value: 1 * 60 * 1000
        },
        {
          label: `3 ${translate('common.minutes')}`,
          value: 3 * 60 * 1000
        },
        {
          label: translate('settings.on_screen_off'),
          value: -1
        },
        {
          label: translate('settings.on_app_close'),
          value: 0
        }
      ]
    },
    timeoutAction: {
      value: user.appTimeoutAction || 'lock',
      onChange: user.setAppTimeoutAction,
      options: [
        {
          label: translate('common.lock'),
          value: 'lock'
        },
        {
          label: translate('common.logout'),
          value: 'logout'
        }
      ]
    }
  }

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('common.settings')}
          right={(<View style={{ width: 10 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      {/* Account */}
      <Text
        text={translate('common.account').toUpperCase()}
        style={SECTION_TITLE}
      />
      <View style={[commonStyles.GRAY_SCREEN_SECTION, {
        backgroundColor: color.background
      }]}>
        {/* Change master pass */}
        <SettingsItem
          name={translate('settings.change_master_pass')}
          action={() => navigation.navigate('changeMasterPassword')}
        />
        {/* Change master pass end */}

        {/* Language */}
        <Select
          value={settings.language.value}
          onChange={settings.language.onChange}
          options={settings.language.options}
          title={translate('common.language')}
          renderSelected={({ label }) => (
            <SettingsItem
              style={{ width: '100%' }}
              name={translate('common.language')}
              right={(
                <Text text={label} />
              )}
            />
          )}
        />
        {/* Language end */}

        {/* Theme */}
        <Select
          value={settings.theme.value}
          onChange={settings.theme.onChange}
          options={settings.theme.options}
          title={translate('settings.theme')}
          renderSelected={({ label }) => (
            <SettingsItem
              style={{ width: '100%' }}
              name={translate('settings.theme')}
              right={(
                <Text text={label} />
              )}
            />
          )}
        />
        {/* Theme end */}

        {/* Default tab */}
        <Select
          value={settings.defaultTab.value}
          onChange={settings.defaultTab.onChange}
          options={settings.defaultTab.options}
          title={translate('settings.defaultTab')}
          renderSelected={({ label }) => (
            <SettingsItem
              noBorder
              style={{ width: '100%' }}
              name={translate('settings.defaultTab')}
              right={(
                <Text text={label} />
              )}
            />
          )}
        />
        {/* Default tab end */}
      </View>
      {/* Account end */}

      {/* Security */}
      <Text
        text={translate('common.security').toUpperCase()}
        style={[SECTION_TITLE, {
          marginTop: 15,
        }]}
      />
      <View style={[commonStyles.GRAY_SCREEN_SECTION, {
        backgroundColor: color.background
      }]}>
        {/* Autofill */}
        <SettingsItem
          name={translate('settings.autofill_service')}
          action={() => navigation.navigate('autofillService')}
        />
        {/* Autofill */}

        {/* Biometric */}
        <SettingsItem
          name={translate('common.biometric_unlocking')}
          noCaret
          right={(
            <Switch
              value={settings.biometric.value}
              onValueChange={settings.biometric.onChage}
              trackColor={{ false: color.disabled, true: color.primary }}
              thumbColor={color.white}
            />
          )}
        />
        {/* Biometric end */}

        {/* Timeout */}
        <Select
          value={settings.timeout.value}
          onChange={settings.timeout.onChange}
          options={settings.timeout.options}
          renderSelected={({ label }) => (
            <SettingsItem
              style={{ width: '100%' }}
              name={translate('settings.timeout')}
              right={(
                <Text text={label} />
              )}
            />
          )}
        />
        {/* Timeout end */}

        {/* Timeout action */}
        <Select
          value={settings.timeoutAction.value}
          onChange={settings.timeoutAction.onChange}
          options={settings.timeoutAction.options}
          renderSelected={({ label }) => (
            <SettingsItem
              noBorder
              style={{ width: '100%' }}
              name={translate('settings.timeout_action')}
              right={(
                <Text text={label} />
              )}
            />
          )}
        />
        {/* Timeout action end */}
      </View>
      {/* Security end */}

      {/* Import/Export */}
      <Text
        text={translate('settings.import_export').toUpperCase()}
        style={[SECTION_TITLE, {
          marginTop: 15,
        }]}
      />
      <View style={[commonStyles.GRAY_SCREEN_SECTION, {
        backgroundColor: color.background
      }]}>
        {/* Import */}
        <SettingsItem
          name={translate('settings.import')}
          action={() => navigation.navigate('import')}
        />
        {/* Import end */}

        {/* Export */}
        <SettingsItem
          noBorder
          name={translate('settings.export')}
          action={() => navigation.navigate('export')}
        />
        {/* Export end */}
      </View>
      {/* Import/Export end */}
    </Layout>
  )
})
