import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, View } from "react-native"
import { Layout, Text, Header } from "../../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { color, commonStyles } from "../../../../theme"
import { Select, Switch } from "native-base"
import { useStores } from "../../../../models"
import { SettingsItem } from "./settings-item"
import { useMixins } from "../../../../services/mixins"
import { PrimaryParamList } from "../../../../navigators/main-navigator"


const SECTION_TITLE: TextStyle = {
  fontSize: 10, 
  marginHorizontal: 20, 
  marginBottom: 8,
}

type ScreenProp = RouteProp<PrimaryParamList, 'settings'>;

export const SettingsScreen = observer(function SettingsScreen() {
  const navigation = useNavigation()
  const { user } = useStores()
  const { notify, isBiometricAvailable } = useMixins()
  const route = useRoute<ScreenProp>()
  const { fromIntro } = route.params

  const [isLoading, setIsLoading] = useState(false)

  // METHODS

  const enableBiometric = async () => {
    setIsLoading(true)
    const available = await isBiometricAvailable()

    if (!available) {
      notify('error', '', 'Biometric is not supported')
    } else {
      user.setBiometricUnlock(true)
      console.log(user.isBiometricUnlock)
      notify('success', '', 'Biometric unlock is enabled')
    }
    
    setIsLoading(false)
  }

  // RENDER

  const settings = {
    language: {
      value: user.language || 'en',
      onChange: user.setLanguage,
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
          label: '1 minute',
          value: '1 * 60 * 1000'
        },
        {
          label: '5 minute',
          value: '5 * 60 * 1000'
        },
        {
          label: '15 minute',
          value: '15 * 60 * 1000'
        },
        {
          label: 'On screen off',
          value: '-1'
        },
        {
          label: 'On app close',
          value: '0'
        }
      ]
    },
    timeoutAction: {
      value: user.appTimeoutAction || 'lock',
      onChange: user.setAppTimeoutAction,
      options: [
        {
          label: 'Lock',
          value: 'lock'
        },
        {
          label: 'Log Out',
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
              navigation.navigate('mainTab')
            } else {
              navigation.goBack()
            }
          }}
          title="Settings"
          right={(<View style={{ width: 10 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      {/* Account */}
      <Text
        text="ACCOUNT"
        style={[SECTION_TITLE]}
      />
      <View style={commonStyles.GRAY_SCREEN_SECTION}>
        <SettingsItem
          name="Change Master Password"
          action={() => navigation.navigate('changeMasterPassword')}
        />

        <SettingsItem
          name="Language"
          noBorder
          noPadding
          right={(
            <Select
              variant="unstyled"
              selectedValue={settings.language.value}
              onValueChange={settings.language.onChange}
              minWidth={150}
            >
              {
                settings.language.options.map(item => (
                  <Select.Item key={item.value} label={item.label} value={item.value} />
                ))
              }
            </Select>
          )}
        />
      </View>
      {/* Account end */}

      {/* Security */}
      <Text
        text="SECURITY"
        style={[SECTION_TITLE, { 
          marginTop: 15,
        }]}
      />
      <View style={[commonStyles.GRAY_SCREEN_SECTION]}>
        <SettingsItem
          name="Biometric Unlock"
          noCaret
          right={(
            <Switch
              isChecked={settings.biometric.value}
              onToggle={settings.biometric.onChage}
              colorScheme="csGreen"
            />
          )}
        />
        <SettingsItem
          name="Timeout"
          noPadding
          right={(
            <Select
              variant="unstyled"
              selectedValue={settings.timeout.value.toString()}
              onValueChange={(val) => settings.timeout.onChange(parseInt(val))}
              minWidth={170}
            >
              {
                settings.timeout.options.map(item => (
                  <Select.Item key={item.value} label={item.label} value={item.value} />
                ))
              }
            </Select>
          )}
        />
        <SettingsItem
          name="Timeout Action"
          noBorder
          noPadding
          right={(
            <Select
              variant="unstyled"
              selectedValue={settings.timeoutAction.value}
              onValueChange={settings.timeoutAction.onChange}
              minWidth={150}
            >
              {
                settings.timeoutAction.options.map(item => (
                  <Select.Item key={item.value} label={item.label} value={item.value} />
                ))
              }
            </Select>
          )}
        />
      </View>
      {/* Security end */}

      {/* Danger zone */}
      <Text
        text="DANGER ZONE"
        style={[SECTION_TITLE, { 
          marginTop: 15
        }]}
      />
      <View style={[commonStyles.GRAY_SCREEN_SECTION]}>
        <SettingsItem
          name="Deauthorize sessions"
          noCaret
          color={color.error}
        />
        <SettingsItem
          name="Delete all account items"
          noCaret
          color={color.error}
        />
        <SettingsItem
          name="Delete account"
          noCaret
          noBorder
          color={color.error}
        />
      </View>
      {/* Danger zone end */}
    </Layout>
  )
})
