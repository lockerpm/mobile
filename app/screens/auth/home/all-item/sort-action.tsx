import React from "react"
import { Text, ActionItem, ActionSheet, Divider, ActionSheetContent } from "../../../../components"
import { color, fontSize } from "../../../../theme"
import { View } from "react-native"
import { useMixins } from "../../../../services/mixins"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect?: Function
  value?: string
  byNameOnly?: boolean
}

export const SortAction = (props: Props) => {
  const { translate } = useMixins()
  const { isOpen, onClose, onSelect, value, byNameOnly } = props

  const lastUpdateOptions = [
    {
      label: translate('all_items.last_updated'),
      value: 'last_updated',
      sort: {
        orderField: 'revisionDate',
        order: 'desc'
      }
    },
    {
      label: translate('all_items.first_updated'),
      value: 'first_updated',
      sort: {
        orderField: 'revisionDate',
        order: 'asc'
      }
    }
  ]

  const nameOptions = [
    {
      label: 'A - Z',
      value: 'az',
      sort: {
        orderField: 'name',
        order: 'asc'
      }
    },
    {
      label: 'Z - A',
      value: 'za',
      sort: {
        orderField: 'name',
        order: 'desc'
      }
    }
  ]

  let sortOptions = [...nameOptions]
  if (!byNameOnly) {
    sortOptions = [...lastUpdateOptions, ...sortOptions]
  }

  return (
    <ActionSheet
      isOpen={isOpen}
      onClose={onClose}
    >
      <View style={{ width: '100%', paddingHorizontal: 20 }}>
        <Text
          preset="semibold"
          text={translate('common.sort')}
          style={{
            fontSize: fontSize.h4,
            marginBottom: 10
          }}
        />
      </View>

      <Divider />

      <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
        {
          sortOptions.map((item, index) => (
            <ActionItem
              key={index}
              name={item.label}
              icon={value === item.value ? "check" : undefined}
              iconColor={color.primary}
              action={() => {
                onClose()
                onSelect && onSelect(item.value, item.sort)
              }}
            />
          ))
        }
      </ActionSheetContent>
    </ActionSheet>
  )
}
