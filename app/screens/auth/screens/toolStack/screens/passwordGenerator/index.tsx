import { useState, useEffect, FC, useCallback } from "react"
import { observer } from "mobx-react-lite"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { useCipherHelper } from "app/services/hook"
import { useCoreService } from "app/services/coreService"
import { useStores } from "app/models"
import { Button, Checkbox, Header, Icon, Screen, Text } from "app/components/cores"
import { PasswordStrength } from "app/components/utils"
import { ToolsScreenProps } from "app/navigators/navigators.types"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import { useClipboard } from "app/services/utils"
import Slider from "@react-native-community/slider"
import { useAppTheme } from "@/utils/useAppTheme"
import { TxKeyPath, useAppLocale } from "@/i18n"
import { useSharedValue } from "react-native-reanimated"
import { ReText } from "react-native-redash"

export const PasswordGeneratorScreen: FC<ToolsScreenProps<"passwordGenerator">> = observer(
  ({ navigation }) => {
    const {
      theme: { colors },
    } = useAppTheme()
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

    const progress = useSharedValue("16")

    const OPTIONS: {
      label: TxKeyPath
      key: boolean
      action: (val: boolean) => void
    }[] = [
      {
        label: "pass_generator:use_upper",
        key: uppercase,
        action: setuppercase,
      },
      {
        label: "pass_generator:use_lower",
        key: lowercase,
        action: setlowercase,
      },
      {
        label: "pass_generator:use_digits",
        key: number,
        action: setnumber,
      },
      {
        label: "pass_generator:use_symbol",
        key: special,
        action: setspecial,
      },
      {
        label: "pass_generator:avoid_ambiguous",
        key: ambiguous,
        action: setambiguous,
      },
    ]

    // Methods
    const regenerate = useCallback(async () => {
      const opt = {
        uppercase,
        lowercase,
        number,
        special,
        ambiguous,
        length: sliderValue,
      }
      if (!opt.lowercase && !opt.uppercase && !opt.number && !opt.special) {
        opt.lowercase = true
      }
      const val = await passwordGenerationService.generatePassword(opt)
      setPassword(val)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ambiguous, lowercase, number, sliderValue, special, uppercase])

    // Watchers
    useEffect(() => {
      regenerate()
    }, [regenerate])

    // Render
    return (
      <Screen
        safeAreaEdges={["bottom"]}
        backgroundColor={colors.block}
        header={
          <Header
            leftIcon="arrow-left"
            titleTx="pass_generator:title"
            onLeftPress={navigation.goBack}
          />
        }
        footer={
          <View style={styles.ph16}>
            <Button
              tx="pass_generator:use_password"
              onPress={() => {
                logFirebaseEvent(AnalyticEvents.GENERATE_PASSWORD, user.email)
                copyToClipboard(password)
              }}
            />
            <Button
              preset="secondary"
              tx="common:regenerate"
              onPress={regenerate}
              style={styles.mt10}
            />
          </View>
        }
        contentContainerStyle={styles.container}
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
          <TouchableOpacity style={styles.row} onPress={() => copyToClipboard(password)}>
            <Text text={password} size={sliderValue > 25 ? "md" : "lg"} style={styles.password} />
            <Icon icon="copy" size={18} />
          </TouchableOpacity>
          <PasswordStrength preset="text" value={getPasswordStrength(password).score} />
        </View>

        <View>
          <Text
            preset="bold"
            color={colors.label}
            size="sm"
            text={translate("common:options").toUpperCase()}
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
            <View style={styles.row}>
              <Text text={`${translate("common:length")}: `} />

              <ReText
                text={progress}
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                  fontSize: 16,
                  color: colors.title,
                }}
              />
            </View>

            <Slider
              value={sliderValue}
              thumbTintColor={colors.primary}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              minimumValue={8}
              maximumValue={64}
              step={1}
              onValueChange={(value) => {
                progress.value = value.toString()
              }}
              onSlidingComplete={(value) => {
                setSliderValue(value)
              }}
            />

            <View style={styles.mt10}>
              {OPTIONS.map((item) => (
                <Checkbox
                  key={item.label}
                  value={item.key}
                  accessibilityLabel={item.label}
                  labelTx={item.label}
                  onValueChange={item.action}
                  LabelTextProps={{
                    color: colors.title,
                    size: "md",
                  }}
                  containerStyle={styles.mv4}
                />
              ))}
            </View>
          </View>
        </View>
      </Screen>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  mt10: {
    marginTop: 10,
  },
  mv4: {
    marginVertical: 4,
  },
  optionsContainer: {
    borderRadius: 12,
    marginBottom: 24,
    padding: 16,
  },
  password: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 10,
  },
  ph16: {
    paddingHorizontal: 16,
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
