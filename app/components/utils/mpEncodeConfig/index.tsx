import { useState } from "react"
import { View, StyleSheet, ViewStyle } from "react-native"

import { Icon, PressableScale, Text, TextProps } from "app/components/cores"
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

const PBDKF2_ITERATIONS_OPTIONS: {
  label: string
  value: number
  recommended?: boolean
}[] = [
  { label: "100,000", value: 100000 },
  { label: "600,000", value: 600000, recommended: true },
]

const ARGON2_MEMORY_OPTIONS: {
  label: string
  value: number
  recommended?: boolean
}[] = [
  { label: "32", value: 32 },
  { label: "64", value: 64, recommended: true },
  { label: "128", value: 128 },
]

const ARGON2_PARALLELISM_OPTIONS: {
  label: string
  value: number
  recommended?: boolean
}[] = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4, recommended: true },
]

const ARGON2_INTERATIONS_OPTIONS: {
  label: string
  value: number
  recommended?: boolean
}[] = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3, recommended: true },
]

type ModalType =
  | "algorithm"
  | "pbkdf2_iterations"
  | "argon2_memory"
  | "argon2_parallelism"
  | "argon2_iterations"

type ModalData = {
  tx: TxKeyPath
  type: ModalType
  options: { label: string; value: number; recommended?: boolean }[]
}

type Props = {
  encodeConfig: Required<MPEncodeConfig>
  setEncodeConfig: React.Dispatch<React.SetStateAction<Required<MPEncodeConfig>>>
}

export const MasterPasswordEncodeConfig = ({ encodeConfig, setEncodeConfig }: Props) => {
  const { themed } = useAppTheme()

  const [modalData, setModalData] = useState<ModalData | null>(null)

  const onSelectOption = (type: ModalType, option: { label: string; value: number }) => {
    switch (type) {
      case "algorithm":
        setEncodeConfig((prev) => {
          if (option.value === KdfType.PBKDF2_SHA256) {
            return {
              ...prev,
              kdf: option.value,
              kdf_iterations: 600000,
              kdf_memory: 0,
              kdf_parallelism: 0,
            }
          } else {
            return {
              ...prev,
              kdf: option.value,
              kdf_iterations: 3,
              kdf_memory: 64,
              kdf_parallelism: 4,
            }
          }
        })
        break
      case "pbkdf2_iterations":
        setEncodeConfig((prev) => ({ ...prev, kdf_iterations: option.value }))
        break
      case "argon2_memory":
        setEncodeConfig((prev) => ({ ...prev, kdf_memory: option.value }))
        break
      case "argon2_parallelism":
        setEncodeConfig((prev) => ({ ...prev, kdf_parallelism: option.value }))
        break
      case "argon2_iterations":
        setEncodeConfig((prev) => ({ ...prev, kdf_iterations: option.value }))
        break
    }
    setModalData(null)
  }

  return (
    <>
      <View style={themed($container)}>
        <DropDownItem
          tx={"encryption_key:alg"}
          value={ALGORITHM_OPTIONS.find((o) => o.value === encodeConfig.kdf)?.label || "PBKDF2"}
          onPress={() => {
            setModalData({
              tx: "encryption_key:alg",
              type: "algorithm",
              options: ALGORITHM_OPTIONS,
            })
          }}
        />

        <DropDownItem
          tx={"encryption_key:interations"}
          value={
            encodeConfig.kdf === KdfType.PBKDF2_SHA256
              ? PBDKF2_ITERATIONS_OPTIONS.find((o) => o.value === encodeConfig.kdf_iterations)
                  ?.label || encodeConfig.kdf_iterations.toString()
              : ARGON2_INTERATIONS_OPTIONS.find((o) => o.value === encodeConfig.kdf_iterations)
                  ?.label || encodeConfig.kdf_iterations.toString()
          }
          onPress={() => {
            setModalData({
              tx: "encryption_key:interations",
              type: "pbkdf2_iterations",
              options:
                encodeConfig.kdf === KdfType.PBKDF2_SHA256
                  ? PBDKF2_ITERATIONS_OPTIONS
                  : ARGON2_INTERATIONS_OPTIONS,
            })
          }}
        />

        {encodeConfig.kdf === KdfType.ARGON2ID && (
          <>
            <DropDownItem
              tx={"encryption_key:memory"}
              value={
                ARGON2_MEMORY_OPTIONS.find((o) => o.value === encodeConfig.kdf_memory)?.label ||
                encodeConfig.kdf_memory.toString()
              }
              onPress={() => {
                setModalData({
                  tx: "encryption_key:memory",
                  type: "argon2_memory",
                  options: ARGON2_MEMORY_OPTIONS,
                })
              }}
            />

            <DropDownItem
              tx={"encryption_key:parallelism"}
              value={
                ARGON2_PARALLELISM_OPTIONS.find((o) => o.value === encodeConfig.kdf_parallelism)
                  ?.label || encodeConfig.kdf_parallelism.toString()
              }
              onPress={() => {
                setModalData({
                  tx: "encryption_key:parallelism",
                  type: "argon2_parallelism",
                  options: ARGON2_PARALLELISM_OPTIONS,
                })
              }}
            />
          </>
        )}

        <Text
          preset="label"
          size="xs"
          tx={
            encodeConfig.kdf === KdfType.PBKDF2_SHA256
              ? "encryption_key:recommend_pbkdf2"
              : "encryption_key:recommend_argon2id"
          }
        />
      </View>
      <NewActionSheet
        header={
          <View style={styles.header}>
            <Text tx={modalData?.tx} size="xxs" />
          </View>
        }
        isOpen={modalData !== null}
        onClose={() => setModalData(null)}
        closeTx={"common:cancel"}
      >
        {modalData?.options.map((item, index) => (
          <ActionSheetItem
            key={index}
            text={item.label}
            isRecommended={item.recommended}
            onPress={() => {
              onSelectOption(modalData!.type, item)
            }}
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

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: colors.background,
  borderRadius: 12,
  gap: 16,
})
