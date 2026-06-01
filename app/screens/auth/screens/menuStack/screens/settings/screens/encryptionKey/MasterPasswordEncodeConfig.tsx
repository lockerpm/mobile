import { useEffect, useState } from "react"
// eslint-disable-next-line no-restricted-imports
import { TextInput, View, StyleSheet, ViewStyle, TextStyle } from "react-native"

import { Icon, PressableIcon, PressableScale, Text, TextProps } from "app/components/cores"
import { KdfType } from "core/enums/kdfType"

import { NewActionSheet } from "@/components/utils"
import { TxKeyPath } from "@/i18n"
import { MPEncodeConfig } from "@/static/types"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

const ALGORITHM_OPTIONS = [
  { label: "PBKDF2", value: KdfType.PBKDF2_SHA256 },
  { label: "Argon2id", value: KdfType.ARGON2ID },
]

const PBKDF2_ITERATIONS = { min: 600000, max: 1000000, default: 600000 }
const ARGON2_ITERATIONS = { min: 1, max: 10, default: 3 }
const ARGON2_MEMORY = { min: 16, max: 128, default: 64 }
const ARGON2_PARALLELISM = { min: 1, max: 10, default: 4 }

const inRange = (n: number, range: { min: number; max: number }) =>
  Number.isFinite(n) && n >= range.min && n <= range.max

export const isEncodeConfigValid = (config: Required<MPEncodeConfig>): boolean => {
  if (config.kdf === KdfType.PBKDF2_SHA256) {
    return inRange(config.kdf_iterations, PBKDF2_ITERATIONS)
  }
  if (config.kdf === KdfType.ARGON2ID) {
    return (
      inRange(config.kdf_iterations, ARGON2_ITERATIONS) &&
      inRange(config.kdf_memory / 1024, ARGON2_MEMORY) &&
      inRange(config.kdf_parallelism, ARGON2_PARALLELISM)
    )
  }
  return false
}

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
          kdf_memory: ARGON2_MEMORY.default * 1024, // convert to MB
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
              value={encodeConfig.kdf_memory / 1024}
              min={ARGON2_MEMORY.min}
              max={ARGON2_MEMORY.max}
              onChange={(n) => setEncodeConfig((prev) => ({ ...prev, kdf_memory: n * 1024 }))}
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
    if (digits === "") {
      onChange(0)
      return
    }
    const parsed = parseInt(digits, 10)
    if (!Number.isNaN(parsed)) {
      onChange(parsed)
    }
  }

  const handleBlur = () => {
    if (text === "") {
      setText(String(value))
    }
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

  const parsed = text === "" ? NaN : parseInt(text, 10)
  const errorTx: TxKeyPath | null = Number.isNaN(parsed)
    ? "encryption_key:min_value_must_be"
    : parsed < min
      ? "encryption_key:min_value_must_be"
      : parsed > max
        ? "encryption_key:max_value_must_be"
        : null
  const errorTxOptions = errorTx === "encryption_key:max_value_must_be" ? { max } : { min }

  return (
    <View>
      <Text tx={tx} />
      <View style={themed($inputItem)}>
        <PressableIcon
          onPress={decrement}
          disabled={decDisabled}
          icon={"minus"}
          color={colors.white}
          size={20}
          containerStyle={[themed($pressableIcon), decDisabled && styles.disable]}
        />
        <TextInput
          style={themed($input)}
          keyboardType="number-pad"
          value={text}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
        />
        <PressableIcon
          onPress={increment}
          disabled={incDisabled}
          icon={"plus"}
          size={20}
          color={colors.white}
          containerStyle={[themed($pressableIcon), incDisabled && styles.disable]}
        />
      </View>
      {errorTx && (
        <Text
          tx={errorTx}
          txOptions={errorTxOptions}
          size="xs"
          color={colors.error}
          style={styles.error}
        />
      )}
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
  disable: {
    opacity: 0.4,
  },
  error: {
    marginLeft: 8,
    marginTop: 4,
  },
  header: {
    alignItems: "center",
    paddingVertical: 8,
  },
})

const $pressableIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 6,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.primary,
  padding: 4,
})

const $dropdownItem: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 8,
  borderWidth: 0.9,
  borderColor: colors.border,
  paddingHorizontal: 12,
  paddingVertical: 8,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 8,
  flexShrink: 1,
})

const $inputItem: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 12,
  borderWidth: 0.9,
  borderColor: colors.border,
  padding: 6,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 8,
  flexShrink: 1,
})

const $input: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  flex: 1,
  textAlign: "center",
  color: colors.text,
  fontFamily: typography.primary.normal,
  fontSize: 16,
  alignSelf: "stretch",
  height: 28,
  marginTop: 2,
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
