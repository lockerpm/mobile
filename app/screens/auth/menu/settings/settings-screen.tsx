import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, View, Switch } from "react-native"
import { Layout, Text, Header, Select } from "../../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { color, commonStyles, fontSize } from "../../../../theme"
import { useStores } from "../../../../models"
import { SettingsItem } from "./settings-item"
import { useMixins } from "../../../../services/mixins"
import { PrimaryParamList } from "../../../../navigators/main-navigator"


const SECTION_TITLE: TextStyle = {
  fontSize: fontSize.small,
  marginHorizontal: 20,
  marginBottom: 8,
}

type ScreenProp = RouteProp<PrimaryParamList, 'settings'>;

export const SettingsScreen = observer(function SettingsScreen() {
  const navigation = useNavigation()
  const { user } = useStores()
  const { notify, isBiometricAvailable, translate } = useMixins()
  const route = useRoute<ScreenProp>()
  const { fromIntro } = route.params

  const [isLoading, setIsLoading] = useState(false)

  // METHODS

  const enableBiometric = async () => {
    setIsLoading(true)
    const available = await isBiometricAvailable()

    if (!available) {
      notify('error', translate('error.biometric_not_support'))
    } else {
      user.setBiometricUnlock(true)
      notify('success', translate('success.biometric_enabled'))
    }

    setIsLoading(false)
  }

  // RENDER

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
    biometric: {
      value: user.isBiometricUnlock,
      onChage: (isActive: boolean) => {
        if (isActive){
          enableBiometric()
        } else {
          user.setBiometricUnlock(isActive)
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
            if (fromIntro) {
              navigation.navigate('mainTab', { screen: 'homeTab' })
            } else {
              navigation.goBack()
            }
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
      <View style={commonStyles.GRAY_SCREEN_SECTION}>
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
      </View>
      {/* Account end */}

      {/* Security */}
      <Text
        text={translate('common.security').toUpperCase()}
        style={[SECTION_TITLE, {
          marginTop: 15,
        }]}
      />
      <View style={commonStyles.GRAY_SCREEN_SECTION}>
        {/* Biometric */}
        <SettingsItem
          name={translate('common.biometric_unlocking')}
          noCaret
          right={(
            <Switch
              value={settings.biometric.value}
              onValueChange={settings.biometric.onChage}
              trackColor={{ false: color.disabled, true: color.palette.green }}
              thumbColor={color.palette.white}
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

      {/* Danger zone */}
      <Text
        text={translate('settings.danger_zone').toUpperCase()}
        style={[SECTION_TITLE, {
          marginTop: 15
        }]}
      />
      <View style={commonStyles.GRAY_SCREEN_SECTION}>
        <SettingsItem
          name={translate('settings.deauthorize_sessions')}
          noCaret
          color={color.error}
        />
        <SettingsItem
          name={translate('settings.delete_all_items')}
          noCaret
          color={color.error}
        />
        <SettingsItem
          name={translate('settings.delete_account')}
          noCaret
          noBorder
          color={color.error}
        />
      </View>
      {/* Danger zone end */}
    </Layout>
  )
})
