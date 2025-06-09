import React, { useMemo } from "react"
import { StyleSheet, View } from "react-native"
import { Text } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils"

export type SortConfigType = {
  sort:
    | {
        orderField: string
        order: "desc" | "asc"
      }
    | undefined
  option: string
}

type SortConfigModalType = SortConfigType & { label: string }

interface Props {
  /**
   * Open Sort Action Config Modal
   */
  isOpen: boolean
  /**
   * Modal dismissed callback
   */
  onClose: () => void
  /**
   * select config
   * @returns
   */
  onSelectSortConfig: (val: SortConfigType) => void
  option: string
}

export const SortActionConfigModal = (props: Props) => {
  const { isOpen, onClose, onSelectSortConfig, option } = props
  const { colors } = useTheme()
  const { translate } = useAppLocale()

  // --------------------COMPUTED---------------------
  const options: SortConfigModalType[] = useMemo(
    () => [
      {
        label: translate("all_items.last_updated"),
        option: "last_updated",
        sort: {
          orderField: "revisionDate",
          order: "desc",
        },
      },
      {
        label: translate("all_items.first_updated"),
        option: "first_updated",
        sort: {
          orderField: "revisionDate",
          order: "asc",
        },
      },
      {
        label: translate("all_items.most_relevant"),
        option: "most_relevant",
        sort: undefined,
      },
      {
        label: "A - Z",
        option: "az",
        sort: {
          orderField: "name",
          order: "asc",
        },
      },
      {
        label: "Z - A",
        option: "za",
        sort: {
          orderField: "name",
          order: "desc",
        },
      },
    ],
    [],
  )

  return (
    <NewActionSheet
      isOpen={isOpen}
      onClose={onClose}
      header={
        <View style={[styles.header, { borderColor: colors.border }]}>
          <Text preset="bold" tx={"common.sort"} size="large" style={styles.centerText} />
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
            onSelectSortConfig({
              sort: item.sort,
              option: item.option,
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
