import React, { useState, useEffect, FC, useRef } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Slider, Checkbox } from "react-native-ui-lib"
import { useAppLocale, useTheme } from "app/services/context"
import { useCipherHelper } from "app/services/hook"
import { useCoreService } from "app/services/coreService"
import { useStores } from "app/models"
import { Button, Header, Icon, Screen, Text } from "app/components/cores"
import { PasswordStrength } from "app/components/utils"
import { AuthStackScreenProps } from "app/navigators/navigators.types"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import { useClipboard } from "app/services/utils"

export const PasswordGeneratorScreen: FC<AuthStackScreenProps<"passwordGenerator">> = observer(
  (props) => {
    const navigation = props.navigation
    const route = props.route

    const { colors } = useTheme()
    const { translate } = useAppLocale()
    const { copyToClipboard } = useClipboard()
    const { getPasswordStrength } = useCipherHelper()
    const { passwordGenerationService } = useCoreService()
    const { cipherStore, user } = useStores()
    const { fromTools } = route.params

    const [password, setPassword] = useState("")
    const [sliderValue, setSliderValue] = useState(16)
    const [uppercase, setuppercase] = useState(true)
    const [lowercase, setlowercase] = useState(true)
    const [number, setnumber] = useState(true)
    const [special, setspecial] = useState(true)
    const [ambiguous, setambiguous] = useState(false)

    const passwordLength = useRef(16)

    const OPTIONS = [
      {
        label: translate("pass_generator.use_upper"),
        key: uppercase,
        action: setuppercase,
      },
      {
        label: translate("pass_generator.use_lower"),
        key: lowercase,
        action: setlowercase,
      },
      {
        label: translate("pass_generator.use_digits"),
        key: number,
        action: setnumber,
      },
      {
        label: translate("pass_generator.use_symbol"),
        key: special,
        action: setspecial,
      },
      {
        label: translate("pass_generator.avoid_ambiguous"),
        key: ambiguous,
        action: setambiguous,
      },
    ]

    // Methods
    const regenerate = async () => {
      const opt = {
        uppercase,
        lowercase,
        number,
        special,
        ambiguous,
        length: passwordLength.current,
      }
      if (!opt.lowercase && !opt.uppercase && !opt.number && !opt.special) {
        opt.lowercase = true
      }
      const val = await passwordGenerationService.generatePassword(opt)
      setPassword(val)
    }

    // Watchers
    useEffect(() => {
      regenerate()
    }, [lowercase, uppercase, number, special, ambiguous])

    // Render
    return (
      <Screen
        safeAreaEdges={["bottom"]}
        backgroundColor={colors.block}
        footerPadding
        padding
        header={
          <Header
            leftIcon="arrow-left"
            title={translate("pass_generator.title")}
            onLeftPress={() => navigation.goBack()}
          />
        }
        footer={
          <View>
            <Button
              text={translate("pass_generator.use_password")}
              onPress={() => {
                logFirebaseEvent(AnalyticEvents.SHARE_ITENS, user.email)
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
              text={translate("common.regenerate")}
              onPress={regenerate}
              style={{ marginTop: 10 }}
            />
          </View>
        }
      >
        {/* Password */}
        <View
          style={{
            marginTop: 16,
            backgroundColor: colors.background,
            padding: 16,
            borderRadius: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text text={password} style={{ flex: 1, fontSize: 20 }} />
            <Icon icon="copy" size={18} onPress={() => copyToClipboard(password)} />
          </View>
          <PasswordStrength preset="text" value={getPasswordStrength(password).score} />
        </View>

        <Text
          preset="bold"
          color={colors.secondaryText}
          size="base"
          text={translate("common.options").toUpperCase()}
          style={{
            paddingVertical: 12,
          }}
        />

        {/* Options */}
        <View
          style={{
            backgroundColor: colors.background,
            padding: 16,
            borderRadius: 12,
          }}
        >
          {/* Password length */}
          <Text text={`${translate("common.length")}: ${sliderValue}`} />
          <Slider
            value={sliderValue}
            thumbTintColor={colors.primary}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            minimumValue={8}
            maximumValue={64}
            step={1}
            onValueChange={(value) => {
              passwordLength.current = value
            }}
            onSeekEnd={() => {
              regenerate()
              setSliderValue(passwordLength.current)
            }}
          />
          {/* Password length end */}

          <View style={{ marginTop: 10 }}>
            {OPTIONS.map((item) => (
              <Checkbox
                key={item.label}
                value={item.key}
                accessibilityLabel={item.label}
                color={colors.primary}
                label={item.label}
                onValueChange={item.action}
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
  },
)
