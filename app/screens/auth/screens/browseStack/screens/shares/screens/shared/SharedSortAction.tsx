import { StyleSheet, View } from "react-native"

import { Text } from "app/components/cores"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils"

import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"

import { SharedSortConfig } from "./useSharedWithYou"

type Props = {
  isOpen: boolean
  onClose: () => void
  option: string
  onSelect: (config: SharedSortConfig) => void
}

export const SharedSortAction = ({ isOpen, onClose, option, onSelect }: Props) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()

  const options: (SharedSortConfig & { label: string })[] = [
    {
      label: translate("shares:sort.accepted_time"),
      option: "accepted_time",
      orderField: "acceptedTime",
      order: "desc",
    },
    {
      label: "A - Z",
      option: "az",
      orderField: "name",
      order: "asc",
    },
  ]

  return (
    <NewActionSheet
      isOpen={isOpen}
      onClose={onClose}
      header={
        <View style={[styles.header, { borderColor: colors.border }]}>
          <Text preset="bold" tx={"common:sort"} size="lg" style={styles.centerText} />
        </View>
      }
    >
      {options.map((item, index) => (
        <NewActionSheetItem
          key={index}
          text={item.label}
          icon={option === item.option ? "check" : undefined}
          iconColor={colors.primary}
          onPress={() => {
            onSelect({
              option: item.option,
              orderField: item.orderField,
              order: item.order,
            })
            onClose()
          }}
        />
      ))}
    </NewActionSheet>
  )
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },
  header: {
    borderBottomWidth: 1,
    padding: 12,
  },
})
