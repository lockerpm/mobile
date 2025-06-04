import React, { useState, useEffect, FC, useRef } from "react"
import { observer } from "mobx-react-lite"
import { StyleSheet, View } from "react-native"
import { Slider, Checkbox } from "react-native-ui-lib"
import { useAppLocale, useTheme } from "app/services/context"
import { useCipherHelper } from "app/services/hook"
import { useCoreService } from "app/services/coreService"
import { useStores } from "app/models"
import { Button, Header, Icon, Screen, Text } from "app/components/cores"
import { PasswordStrength } from "app/components/utils"
import { ToolsStackScreenProps } from "app/navigators/navigators.types"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import { useClipboard } from "app/services/utils"

export const PasswordGeneratorScreen: FC<ToolsStackScreenProps<"passwordGenerator">> = observer(
  ({ navigation }) => {
    const { colors } = useTheme()
    const { translate } = useAppLocale()
    const { copyToClipboard } = useClipboard()
    const { getPasswordStrength } = useCipherHelper()
    const { passwordGenerationService } = useCoreService()
    const { user } = useStores()

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
            titleTx="pass_generator.title"
            onLeftPress={navigation.goBack}
          />
        }
        footer={
          <View>
            <Button
              tx="pass_generator.use_password"
              onPress={() => {
                logFirebaseEvent(AnalyticEvents.GENERATE_PASSWORD, user.email)
                copyToClipboard(password)
              }}
            />
            <Button
              preset="secondary"
              tx="common.regenerate"
              onPress={regenerate}
              style={styles.mt10}
            />
          </View>
        }
      >
        {/* Password */}
        <View
          style={[
            styles.pwContainer,
            {
              backgroundColor: colors.background,
            },
          ]}
        >
          <View style={styles.row}>
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
          style={styles.pv12}
        />

        {/* Options */}
        <View
          style={[
            styles.optionsContainer,
            {
              backgroundColor: colors.background,
            },
          ]}
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

          <View style={styles.mt10}>
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

const styles = StyleSheet.create({
  mt10: {
    marginTop: 10,
  },
  optionsContainer: {
    borderRadius: 12,
    padding: 16,
  },
  pv12: {
    paddingVertical: 12,
  },

  pwContainer: {
    borderRadius: 12,
    marginTop: 16,
    padding: 16,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
