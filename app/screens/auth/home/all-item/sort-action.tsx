import React from "react"
import { Actionsheet, Divider } from "native-base"
import { Text, ActionItem } from "../../../../components"
import { color } from "../../../../theme"

interface Props {
  isOpen: boolean,
  onClose: Function,
  onSelect?: Function,
  value?: string
}

export const SortAction = (props: Props) => {
  const { isOpen, onClose, onSelect, value } = props

  const sortOptions = [
    {
      label: 'Last Updated',
      value: 'last_updated',
      sort: {
        orderField: 'revisionDate',
        order: 'desc'
      }
    },
    {
      label: 'First Updated',
      value: 'first_updated',
      sort: {
        orderField: 'revisionDate',
        order: 'asc'
      }
    },
    {
      label: 'A to Z',
      value: 'az',
      sort: {
        orderField: 'name',
        order: 'asc'
      }
    },
    {
      label: 'Z to A',
      value: 'za',
      sort: {
        orderField: 'name',
        order: 'desc'
      }
    }
  ]

  return (
    <Actionsheet
      isOpen={isOpen}
      onClose={onClose}
    >
      <Actionsheet.Content>
        <Text
          preset="semibold"
          text="Sort"
          style={{
            fontSize: 18,
            marginBottom: 15
          }}
        />

        <Divider borderColor={color.line} />

        {
          sortOptions.map((item, index) => (
            <ActionItem
              key={index}
              name={item.label}
              icon={value === item.value ? "check" : undefined}
              iconColor={color.palette.green}
              action={() => {
                onClose()
                onSelect && onSelect(item.value, item.sort)
              }}
            />
          ))
        }
      </Actionsheet.Content>
    </Actionsheet>
  )
}