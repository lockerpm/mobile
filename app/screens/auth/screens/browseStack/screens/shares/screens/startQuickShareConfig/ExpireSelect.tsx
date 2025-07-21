import { NewActionSheet } from "@/components/utils"
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"
import { Icon, Text } from "@/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { useState } from "react"
import { TxKeyPath } from "@/i18n"

interface Props {
  setExpireAfter: (val: number | null) => void
  expireAfter: number | null
}

const ExpireData = [
  {
    label: "quick_shares:config.expired.1h",
    val: 60 * 60 * 1,
  },
  {
    label: "quick_shares:config.expired.24h",
    val: 60 * 60 * 24,
  },
  {
    label: "quick_shares:config.expired.7d",
    val: 60 * 60 * 24 * 7,
  },
  {
    label: "quick_shares:config.expired.14d",
    val: 60 * 60 * 24 * 14,
  },
  {
    label: "quick_shares:config.expired.30d",
    val: 60 * 60 * 24 * 30,
  },
  {
    label: "quick_shares:config.expired.no_expired",
    val: null,
  },
]

export const ExpireSelect = ({ setExpireAfter, expireAfter }: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const [openExpireSelect, setOpenExpireSelect] = useState(false)

  return (
    <View>
      <TouchableOpacity
        style={themed($expireSelect)}
        onPress={() => {
          setOpenExpireSelect(true)
        }}
      >
        <Text tx={ExpireData.find((e) => e.val === expireAfter)?.label as TxKeyPath} />
      </TouchableOpacity>
      <NewActionSheet
        isOpen={openExpireSelect}
        onClose={() => {
          setOpenExpireSelect(false)
        }}
        header={
          <View style={styles.p16}>
            <Text preset="bold" tx="quick_shares:config.expired.tl" size="lg" />
          </View>
        }
      >
        {ExpireData.map((e) => (
          <TouchableOpacity
            key={e.label}
            onPress={() => {
              setOpenExpireSelect(false)
              setExpireAfter(e.val)
            }}
            style={styles.p16}
          >
            <View style={styles.row}>
              <Text tx={e.label as TxKeyPath} style={styles.label} />
              {expireAfter === e.val && <Icon icon="check" color={colors.primary} />}
            </View>
          </TouchableOpacity>
        ))}
      </NewActionSheet>
    </View>
  )
}

const $expireSelect: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  borderWidth: 1,
  borderRadius: 8,
  borderColor: colors.border,
  padding: 12,
})

const styles = StyleSheet.create({
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
})
