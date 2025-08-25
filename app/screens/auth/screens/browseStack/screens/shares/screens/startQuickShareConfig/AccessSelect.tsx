import { NewActionSheet } from "@/components/utils"
import { Dimensions, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"
import { Icon, Text, TextInput } from "@/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"
import { TxKeyPath } from "@/i18n"
import { useRef, useState } from "react"
import { ThemedStyle } from "@/theme"

type Props = {
  setCountAccess: (val: boolean) => void
  countAccess: boolean
  maxAccessCount: string
  setMaxAccessCount: (val: string) => void
}

const AccessCountOptions = [
  {
    label: "quick_shares:config.access_options.unlimited",
    value: false,
  },
  {
    label: "quick_shares:config.access_options.time",
    value: true,
  },
]

const width = Dimensions.get("window").width

export const AccessSelect = ({
  setCountAccess,
  countAccess,
  maxAccessCount,
  setMaxAccessCount,
}: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const inputRef = useRef(null)
  const [openAccessSelect, setOpenAccessSelect] = useState(false)

  return (
    <View>
      <View style={styles.row2}>
        <TouchableOpacity
          style={themed($accessCount)}
          onPress={() => {
            setOpenAccessSelect(true)
          }}
        >
          <Text tx={AccessCountOptions.find((e) => e.value === countAccess)?.label as TxKeyPath} />
        </TouchableOpacity>

        {countAccess && (
          <>
            <View style={styles.w12} />
            <View
              style={styles.countAccess}
              onTouchStart={() => {
                // @ts-ignore
                inputRef?.current?.focus()
              }}
            >
              <TextInput
                ref={inputRef}
                keyboardType="number-pad"
                value={maxAccessCount.toString()}
                onChangeText={(value) => {
                  setMaxAccessCount(value.replace(/[^0-9]/g, ""))
                }}
                onBlur={() => {
                  if (!maxAccessCount || maxAccessCount === "0" || !maxAccessCount) {
                    setMaxAccessCount("1")
                    return
                  }
                  if (maxAccessCount.length > 0 && maxAccessCount[0] === "0") {
                    // Remove leading zeros
                    setMaxAccessCount(maxAccessCount.replace(/^0+/, ""))
                  }
                }}
                maxLength={8}
              />
            </View>
          </>
        )}
      </View>
      <NewActionSheet
        isOpen={openAccessSelect}
        onClose={() => {
          setOpenAccessSelect(false)
        }}
        header={
          <View style={styles.p16}>
            <Text preset="bold" tx="quick_shares:config.expired.tl" size="lg" />
          </View>
        }
      >
        {AccessCountOptions.map((a) => (
          <TouchableOpacity
            key={a.label}
            onPress={() => {
              setCountAccess(a.value)
              setOpenAccessSelect(false)
            }}
            style={styles.p16}
          >
            <View style={styles.row}>
              <Text tx={a.label as TxKeyPath} style={styles.label} />
              {countAccess === a.value && <Icon icon="check" color={colors.primary} />}
            </View>
          </TouchableOpacity>
        ))}
      </NewActionSheet>
    </View>
  )
}

const $accessCount: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: width / 2 - 22,
  borderWidth: 1,
  borderRadius: 8,
  borderColor: colors.border,
  padding: 12,
})

const styles = StyleSheet.create({
  countAccess: {
    width: width / 2 - 22,
  },
  label: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  p16: {
    padding: 16,
    paddingVertical: 12,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  row2: {
    alignItems: "center",
    flexDirection: "row",
  },
  w12: {
    width: 12,
  },
})
