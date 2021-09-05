import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header, Text, Button, PasswordStrength } from "../../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { color, commonStyles } from "../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { Checkbox, Slider } from "native-base"
import { useMixins } from "../../../../services/mixins"
import { useCoreService } from "../../../../services/core-service"
import { useStores } from "../../../../models"
import { PrimaryParamList } from "../../../../navigators/main-navigator"
import { translate } from "../../../../i18n"


type ScreenProp = RouteProp<PrimaryParamList, 'passwordGenerator'>;

export const PasswordGeneratorScreen = observer(function PasswordGeneratorScreen() {
  const navigation = useNavigation()
  const { getPasswordStrength, copyToClipboard } = useMixins()
  const { passwordGenerationService } = useCoreService()
  const { cipherStore } = useStores()
  const route = useRoute<ScreenProp>()
  const { fromTools } = route.params

  const [password, setPassword] = useState('')
  const [passwordLen, setPasswordLen] = useState(16)
  const [options, setOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    number: true,
    special: true,
    ambiguous: false
  })

  const OPTIONS = [
    {
      label: translate('pass_generator.use_upper'),
      key: 'uppercase'
    },
    {
      label: translate('pass_generator.use_lower'),
      key: 'lowercase'
    },
    {
      label: translate('pass_generator.use_digits'),
      key: 'number'
    },
    {
      label: translate('pass_generator.use_symbol'),
      key: 'special'
    },
    {
      label: translate('pass_generator.avoid_ambiguous'),
      key: 'ambiguous'
    }
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
    <Layout
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      borderBottom
      header={(
        <Header
          title={translate('pass_generator.title')}
          goBack={() => navigation.goBack()}
          right={(
            <View style={{ width: 10 }} />
          )}
        />
      )}
      footer={(
        <View>
          <Button
            isNativeBase
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
            isNativeBase
            variant="outline"
            text={translate('common.regenerate')}
            onPress={regenerate}
            style={{ marginTop: 10 }}
          />
        </View>
      )}
    >
      {/* Password */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white
        }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Text
            preset="black"
            text={password}
            style={{ flex: 1, fontSize: 16 }}
          />

          <Button
            preset="link"
            onPress={() => copyToClipboard(password)}
          >
            <IoniconsIcon
              name="copy-outline"
              size={18}
              color={color.textBlack}
            />
          </Button>
        </View>

        <PasswordStrength
          preset="text"
          value={getPasswordStrength(password).score}
        />
      </View>
      {/* Password end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text
          text={translate('common.options').toUpperCase()}
          style={{ fontSize: 10 }}
        />
      </View>

      {/* Options */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white
        }]}
      >
        <Text
          text={translate('common.length')}
          preset="black"
          style={{ fontSize: 12 }}
        />
        <Slider
          colorScheme="csGreen"
          defaultValue={16}
          minValue={8}
          maxValue={64}
          accessibilityLabel="length"
          step={1}
          mb={7}
          onChange={setPasswordLen}
          onChangeEnd={len => setOptions({ ...options, length: len })}
        >
          <Slider.Track bg={color.block}>
            <Slider.FilledTrack />
          </Slider.Track>
          <Slider.Thumb>
            <View style={{
              position: 'absolute',
              top: 20,
              left: -4,
              width: 25,
              borderColor: color.text,
              borderWidth: 1,
              borderRadius: 5
            }}>
              <Text
                preset="black"
                style={{ fontSize: 12, textAlign: 'center' }}
                text={passwordLen.toString()}
              />
            </View>
          </Slider.Thumb>
        </Slider>

        <Checkbox.Group colorScheme="csGreen">
          {
            OPTIONS.map((item) => (
              <Checkbox
                key={item.key}
                value={item.key}
                my={1}
                accessibilityLabel={item.key}
                onChange={checked => {
                  const newOptions = { ...options }
                  newOptions[item.key] = checked
                  setOptions(newOptions)
                }}
              >
                <Text
                  text={item.label}
                  preset="black"
                  style={{ marginLeft: 10 }}
                />
              </Checkbox>
            ))
          }
        </Checkbox.Group>
      </View>
      {/* Options end */}
    </Layout>
  )
})
