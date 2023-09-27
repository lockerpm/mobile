import React, { useState, useEffect, FC } from 'react'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Slider, Checkbox } from 'react-native-ui-lib'
import { AppStackScreenProps } from 'app/navigators'
import { useTheme } from 'app/services/context'
import { useCipherHelper, useHelper } from 'app/services/hook'
import { useCoreService } from 'app/services/coreService'
import { useStores } from 'app/models'
import { translate } from 'app/i18n'
import { Button, Header, Icon, Screen, Text } from 'app/components/cores'
import { PasswordStrength } from 'app/components/utils'

export const PasswordGeneratorScreen: FC<AppStackScreenProps<'passwordGenerator'>> = observer(
  (props) => {
    const navigation = props.navigation
    const route = props.route

    const { colors } = useTheme()
    const { copyToClipboard } = useHelper()
    const { getPasswordStrength } = useCipherHelper()
    const { passwordGenerationService } = useCoreService()
    const { cipherStore } = useStores()
    const { fromTools } = route.params

    const [password, setPassword] = useState('')
    const [passwordLen, setPasswordLen] = useState(16)
    const [sliderValue, setSliderValue] = useState(16)
    const [options, setOptions] = useState({
      length: 16,
      uppercase: true,
      lowercase: true,
      number: true,
      special: true,
      ambiguous: false,
    })

    const OPTIONS = [
      {
        label: translate('pass_generator.use_upper'),
        key: 'uppercase',
      },
      {
        label: translate('pass_generator.use_lower'),
        key: 'lowercase',
      },
      {
        label: translate('pass_generator.use_digits'),
        key: 'number',
      },
      {
        label: translate('pass_generator.use_symbol'),
        key: 'special',
      },
      {
        label: translate('pass_generator.avoid_ambiguous'),
        key: 'ambiguous',
      },
    ]

    // Methods
    const regenerate = async () => {
      const opt = { ...options }
      if (!opt.lowercase && !opt.uppercase && !opt.lowercase && !opt.number && !opt.special) {
        opt.lowercase = true
      }
      const password = await passwordGenerationService.generatePassword(opt)
      setPassword(password)
    }

    // Watchers
    useEffect(() => {
      regenerate()
    }, [options])

    // Render
    return (
      <Screen
        backgroundColor={colors.block}
        header={
          <Header
            leftIcon="arrow-left"
            title={translate('pass_generator.title')}
            onLeftPress={() => navigation.goBack()}
          />
        }
        footer={
          <View>
            <Button
              text={translate('pass_generator.use_password')}
              onPress={() => {
                if (fromTools) {
                  copyToClipboard(password)
                } else {
                  cipherStore.setGeneratedPassword(password)
                  navigation.goBack()
                }
              }}
            />
            <Button
              preset="secondary"
              text={translate('common.regenerate')}
              onPress={regenerate}
              style={{ marginTop: 10 }}
            />
          </View>
        }
      >
        {/* Password */}
        <View
          style={{
            backgroundColor: colors.background,
            padding: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text text={password} style={{ flex: 1, fontSize: 20 }} />

            <Icon icon="copy" size={18} onPress={() => copyToClipboard(password)} />
          </View>
          <PasswordStrength preset="text" value={getPasswordStrength(password).score} />
        </View>
        {/* Password end */}

        <View style={{ padding: 16 }}>
          <Text preset="label" size="base" text={translate('common.options').toUpperCase()} />
        </View>

        {/* Options */}
        <View
          style={{
            backgroundColor: colors.background,
            padding: 16,
          }}
        >
          {/* Password length */}
          <Text text={`${translate('common.length')}: ${passwordLen}`} />
          <Slider
            value={sliderValue}
            thumbTintColor={colors.primary}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            minimumValue={8}
            maximumValue={64}
            step={1}
            onValueChange={setPasswordLen}
            onSeekEnd={() => {
              setOptions({ ...options, length: passwordLen })
              setSliderValue(passwordLen)
            }}
          />
          {/* Password length end */}

          <View style={{ marginTop: 10 }}>
            {OPTIONS.map((item) => (
              <Checkbox
                key={item.key}
                value={options[item.key]}
                accessibilityLabel={item.key}
                color={colors.primary}
                label={item.label}
                onValueChange={(checked) => {
                  const newOptions = { ...options }
                  newOptions[item.key] = checked
                  if (!OPTIONS.some((o) => newOptions[o.key])) {
                    newOptions.lowercase = true
                  }
                  setOptions(newOptions)
                }}
                style={{
                  marginVertical: 7,
                }}
                labelStyle={{
                  color: colors.title,
                  fontSize: 16,
                }}
              />
            ))}
          </View>
        </View>
      </Screen>
    )
  }
)
