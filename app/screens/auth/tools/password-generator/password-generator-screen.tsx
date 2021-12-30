import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header, Text, Button, PasswordStrength } from "../../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { useMixins } from "../../../../services/mixins"
import { useCoreService } from "../../../../services/core-service"
import { useStores } from "../../../../models"
import { PrimaryParamList } from "../../../../navigators/main-navigator"
import { Slider, Checkbox } from "react-native-ui-lib"
import { useCipherHelpersMixins } from "../../../../services/mixins/cipher/helpers"


type ScreenProp = RouteProp<PrimaryParamList, 'passwordGenerator'>;

export const PasswordGeneratorScreen = observer(function PasswordGeneratorScreen() {
  const navigation = useNavigation()
  const { copyToClipboard, translate, color } = useMixins()
  const { getPasswordStrength } = useCipherHelpersMixins()
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
            preset="outline"
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
          backgroundColor: color.background
        }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Text
            preset="black"
            text={password}
            style={{ flex: 1, fontSize: fontSize.h4 }}
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
          style={{ fontSize: fontSize.small }}
        />
      </View>

      {/* Options */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.background
        }]}
      >
        {/* Password length */}
        <Text
          text={`${translate('common.length')}: ${passwordLen}`}
          preset="black"
          style={{ fontSize: fontSize.p }}
        />
        <Slider
          // value={passwordLen}
          thumbTintColor={color.primary}
          minimumTrackTintColor={color.primary}
          maximumTrackTintColor={color.line}
          minimumValue={8}
          maximumValue={64}
          step={1}
          onValueChange={setPasswordLen}
          onSeekEnd={() => setOptions({ ...options, length: passwordLen })}
        />
        {/* Password length end */}

        <View style={{ marginTop: 10 }}>
          {
            OPTIONS.map((item) => (
              <Checkbox
                key={item.key}
                value={options[item.key]}
                accessibilityLabel={item.key}
                color={color.primary}
                label={item.label}
                onValueChange={checked => {
                  const newOptions = { ...options }
                  newOptions[item.key] = checked
                  setOptions(newOptions)
                }}
                style={{
                  marginVertical: 7
                }}
                labelStyle={{
                  color: color.textBlack,
                  fontSize: fontSize.p
                }}
              />
            ))
          }
        </View>
      </View>
      {/* Options end */}
    </Layout>
  )
})
