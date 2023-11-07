import React from "react"
import { View } from "react-native"
import { Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import { ActionSheet } from "../actionsSheet/ActionSheet"
import { ActionItem } from "../actionsSheet/ActionSheetItem"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect?: (val: string, sortOption: any) => void
  value?: string
  byNameOnly?: boolean
}

export const SortActionConfigModal = (props: Props) => {
  const { isOpen, onClose, onSelect, value, byNameOnly } = props
  const { colors } = useTheme()
  const { translate } = useHelper()
  const lastUpdateOptions = [
    {
      label: translate("all_items.last_updated"),
      value: "last_updated",
      sort: {
        orderField: "revisionDate",
        order: "desc",
      },
    },
    {
      label: translate("all_items.first_updated"),
      value: "first_updated",
      sort: {
        orderField: "revisionDate",
        order: "asc",
      },
    },
  ]

  const nameOptions = [
    {
      label: translate("all_items.most_relevant"),
      value: "most_relevant",
      sort: null,
    },
    {
      label: "A - Z",
      value: "az",
      sort: {
        orderField: "name",
        order: "asc",
      },
    },
    {
      label: "Z - A",
      value: "za",
      sort: {
        orderField: "name",
        order: "desc",
      },
    },
  ]

  let sortOptions = [...nameOptions]
  if (!byNameOnly) {
    sortOptions = [...lastUpdateOptions, ...sortOptions]
  }

  return (
    <ActionSheet
      isOpen={isOpen}
      onClose={onClose}
      header={
        <View
          style={{
            width: "100%",
            paddingHorizontal: 20,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          }}
        >
          <Text
            preset="bold"
            text={translate("common.sort")}
            size="large"
            style={{
              marginBottom: 10,
            }}
          />
        </View>
      }
    >
      {sortOptions.map((item, index) => (
        <ActionItem
          key={index}
          name={item.label}
          icon={value === item.value ? "check" : undefined}
          iconColor={colors.primary}
          action={() => {
            onSelect && onSelect(item.value, item.sort)
            onClose()
          }}
        />
      ))}
    </ActionSheet>
  )
}
