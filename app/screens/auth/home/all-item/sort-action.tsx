import React from "react"
import { Actionsheet, Divider } from "native-base"
import { Text } from "../../../../components"
import { color } from "../../../../theme"

interface Props {
  isOpen?: boolean,
  onClose?: Function
}

export const SortAction = (props: Props) => {
  const sortOptions = [
    {
      label: 'Last Updated',
      value: 'last_updated'
    },
    {
      label: 'First Updated',
      value: 'first_updated'
    },
    {
      label: 'A to Z',
      value: 'az'
    },
    {
      label: 'Z to A',
      value: 'za'
    }
  ]

  return (
    <Actionsheet
      isOpen={props.isOpen}
      onClose={props.onClose}
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
            <Actionsheet.Item key={index}>
              <Text
                text={item.label}
                style={{ color: color.textBlack }}
              />
            </Actionsheet.Item>
          ))
        }
      </Actionsheet.Content>
    </Actionsheet>
  )
}