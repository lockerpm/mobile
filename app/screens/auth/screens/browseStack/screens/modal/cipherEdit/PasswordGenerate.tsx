import { useState, useEffect, useCallback } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import Slider from "@react-native-community/slider"
import { useSharedValue } from "react-native-reanimated"
import { ReText } from "react-native-redash"

import {
  BottomModalContainer,
  BottomModalHeader,
  Button,
  Checkbox,
  Text,
} from "app/components/cores"
import { PasswordStrength } from "app/components/utils"
import { useStores } from "app/models"
import { useCoreService } from "app/services/coreService"
import { useCipherHelper } from "app/services/hook"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"

import { TxKeyPath, useAppLocale } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { AppEventType, EventBus } from "@/utils/eventBus"
import { useAppTheme } from "@/utils/useAppTheme"

type Props = {
  onClose: () => void
}
export const PasswordGenerate = ({ onClose }: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()
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

  const usePassword = useCallback(() => {
    logFirebaseEvent(AnalyticEvents.GENERATE_PASSWORD, user.email)
    EventBus.emit(AppEventType.CIPHER_EDIT_GENERATE_PASSWORD, password)
    onClose()
  }, [password, onClose, user.email])

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
    <BottomModalContainer>
      <BottomModalHeader tx="pass_generator:title" onClose={onClose} />
      <View style={themed($password)}>
        <Text text={password} size={sliderValue > 25 ? "md" : "lg"} style={styles.password} />
        <PasswordStrength preset="text" value={getPasswordStrength(password).score} />
      </View>

      <View>
        <View style={themed($options)}>
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
                onPress={() => item.action(!item.key)}
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
      <View style={styles.ph16}>
        <Button tx="pass_generator:use_password" onPress={usePassword} />
        <Button
          preset="secondary"
          tx="common:regenerate"
          onPress={regenerate}
          style={styles.mt10}
        />
      </View>
    </BottomModalContainer>
  )
}

const $password: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 12,
  marginTop: 8,
  padding: 16,
  paddingVertical: 12,
  backgroundColor: colors.block,
  marginHorizontal: 16,
})

const $options: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 12,
  marginBottom: 24,
  padding: 16,
  backgroundColor: colors.background,
})

const styles = StyleSheet.create({
  mt10: {
    marginTop: 10,
  },
  mv4: {
    marginVertical: 4,
  },
  password: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 10,
  },
  ph16: {
    paddingHorizontal: 16,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
