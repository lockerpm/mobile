import { useEffect, useState } from "react"
// eslint-disable-next-line no-restricted-imports
import { TextInput, View, StyleSheet, ViewStyle, TextStyle } from "react-native"

import { Icon, PressableIcon, PressableScale, Text, TextProps } from "app/components/cores"
import { KdfType } from "core/enums/kdfType"

import { TxKeyPath } from "@/i18n"
import { MPEncodeConfig } from "@/static/types"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

import { NewActionSheet } from "../actionSheet/ActionSheet"

const ALGORITHM_OPTIONS = [
  { label: "PBKDF2", value: KdfType.PBKDF2_SHA256 },
  { label: "Argon2id", value: KdfType.ARGON2ID },
]

const PBKDF2_ITERATIONS = { min: 600000, max: 1000000, default: 600000 }
const ARGON2_ITERATIONS = { min: 1, max: 10, default: 3 }
const ARGON2_MEMORY = { min: 16, max: 128, default: 64 }
const ARGON2_PARALLELISM = { min: 1, max: 10, default: 4 }

type Props = {
  encodeConfig: Required<MPEncodeConfig>
  setEncodeConfig: React.Dispatch<React.SetStateAction<Required<MPEncodeConfig>>>
}

export const MasterPasswordEncodeConfig = ({ encodeConfig, setEncodeConfig }: Props) => {
  const { themed } = useAppTheme()

  const [isAlgorithmSheetOpen, setIsAlgorithmSheetOpen] = useState(false)

  const onSelectAlgorithm = (value: number) => {
    setEncodeConfig((prev) => {
      if (value === KdfType.PBKDF2_SHA256) {
        return {
          ...prev,
          kdf: value,
          kdf_iterations: PBKDF2_ITERATIONS.default,
          kdf_memory: 0,
          kdf_parallelism: 0,
        }
      } else {
        return {
          ...prev,
          kdf: value,
          kdf_iterations: ARGON2_ITERATIONS.default,
          kdf_memory: ARGON2_MEMORY.default,
          kdf_parallelism: ARGON2_PARALLELISM.default,
        }
      }
    })
    setIsAlgorithmSheetOpen(false)
  }

  const isPbkdf2 = encodeConfig.kdf === KdfType.PBKDF2_SHA256

  return (
    <>
      <View style={themed($container)}>
        <DropDownItem
          tx={"encryption_key:alg"}
          value={ALGORITHM_OPTIONS.find((o) => o.value === encodeConfig.kdf)?.label || "PBKDF2"}
          onPress={() => setIsAlgorithmSheetOpen(true)}
        />

        {isPbkdf2 ? (
          <NumberStepperInput
            tx={"encryption_key:interations"}
            value={encodeConfig.kdf_iterations}
            min={PBKDF2_ITERATIONS.min}
            max={PBKDF2_ITERATIONS.max}
            onChange={(n) => setEncodeConfig((prev) => ({ ...prev, kdf_iterations: n }))}
          />
        ) : (
          <>
            <NumberStepperInput
              tx={"encryption_key:interations"}
              value={encodeConfig.kdf_iterations}
              min={ARGON2_ITERATIONS.min}
              max={ARGON2_ITERATIONS.max}
              onChange={(n) => setEncodeConfig((prev) => ({ ...prev, kdf_iterations: n }))}
            />
            <NumberStepperInput
              tx={"encryption_key:memory"}
              value={encodeConfig.kdf_memory}
              min={ARGON2_MEMORY.min}
              max={ARGON2_MEMORY.max}
              onChange={(n) => setEncodeConfig((prev) => ({ ...prev, kdf_memory: n }))}
            />
            <NumberStepperInput
              tx={"encryption_key:parallelism"}
              value={encodeConfig.kdf_parallelism}
              min={ARGON2_PARALLELISM.min}
              max={ARGON2_PARALLELISM.max}
              onChange={(n) => setEncodeConfig((prev) => ({ ...prev, kdf_parallelism: n }))}
            />
          </>
        )}

        <Text
          preset="label"
          size="xs"
          tx={isPbkdf2 ? "encryption_key:recommend_pbkdf2" : "encryption_key:recommend_argon2id"}
        />
      </View>
      <NewActionSheet
        header={
          <View style={styles.header}>
            <Text tx={"encryption_key:alg"} size="xxs" />
          </View>
        }
        isOpen={isAlgorithmSheetOpen}
        onClose={() => setIsAlgorithmSheetOpen(false)}
        closeTx={"common:cancel"}
      >
        {ALGORITHM_OPTIONS.map((item, index) => (
          <ActionSheetItem
            key={index}
            text={item.label}
            onPress={() => onSelectAlgorithm(item.value)}
          />
        ))}
      </NewActionSheet>
    </>
  )
}

const DropDownItem = ({
  tx,
  value,
  onPress,
}: {
  tx: TxKeyPath
  value: string
  onPress: () => void
}) => {
  const { themed } = useAppTheme()

  return (
    <View>
      <Text tx={tx} />
      <PressableScale style={themed($dropdownItem)} onPress={onPress}>
        <Text text={value} />
        <Icon icon={"caret-up-down-fill"} size={16} />
      </PressableScale>
    </View>
  )
}

const NumberStepperInput = ({
  tx,
  value,
  min,
  max,
  onChange,
}: {
  tx: TxKeyPath
  value: number
  min: number
  max: number
  onChange: (n: number) => void
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const [text, setText] = useState(String(value))

  useEffect(() => {
    setText(String(value))
  }, [value])

  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  const handleChangeText = (next: string) => {
    const digits = next.replace(/[^0-9]/g, "")
    setText(digits)
  }

  const handleBlur = () => {
    if (text === "") {
      onChange(min)
      setText(String(min))
      return
    }
    const parsed = parseInt(text, 10)
    if (Number.isNaN(parsed)) {
      onChange(min)
      setText(String(min))
      return
    }
    const clamped = clamp(parsed)
    onChange(clamped)
    setText(String(clamped))
  }

  const decrement = () => {
    const next = clamp(value - 1)
    onChange(next)
    setText(String(next))
  }

  const increment = () => {
    const next = clamp(value + 1)
    onChange(next)
    setText(String(next))
  }

  const decDisabled = value <= min
  const incDisabled = value >= max

  return (
    <View>
      <Text tx={tx} />
      <View style={themed($dropdownItem)}>
        <TextInput
          style={themed($input)}
          keyboardType="number-pad"
          value={text}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
        />
        <View style={styles.stepperButtons}>
          <PressableIcon
            onPress={decrement}
            disabled={decDisabled}
            icon={"caret-down-fill"}
            color={decDisabled ? colors.label : colors.text}
            size={16}
          />

          <PressableIcon
            onPress={increment}
            disabled={incDisabled}
            icon={"caret-up-fill"}
            size={16}
            color={incDisabled ? colors.label : colors.text}
          />
        </View>
      </View>
    </View>
  )
}

const ActionSheetItem = (props: {
  bottomBorder?: boolean
  onPress: () => void
  text?: TextProps["text"]
  isRecommended?: boolean
}) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { text, onPress, isRecommended } = props

  const container: ViewStyle = {
    borderBottomWidth: props.bottomBorder ? 1 : 0,
    borderBottomColor: colors.border,
    marginLeft: 16,
  }

  return (
    <PressableScale onPress={onPress}>
      <View style={styles.container}>
        <Text text={text} />
        {isRecommended && (
          <Text tx={"encryption_key:recommended"} color={colors.primary} size="xs" />
        )}
      </View>
      <View style={container} />
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    alignItems: "center",
    paddingVertical: 8,
  },
  stepperButtons: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
})

const $dropdownItem: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 4,
  borderWidth: 0.9,
  borderColor: colors.border,
  paddingHorizontal: 12,
  paddingVertical: 8,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 8,
})

const $input: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  flex: 1,
  padding: 0,
  color: colors.text,
  fontFamily: typography.primary.normal,
  fontSize: 16,
  alignSelf: "stretch",
  height: 24,
  paddingVertical: 0,
  paddingHorizontal: 0,
})

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: colors.background,
  borderRadius: 12,
  gap: 16,
})
