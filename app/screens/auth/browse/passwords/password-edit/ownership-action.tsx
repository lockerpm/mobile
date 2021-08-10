import React from "react"
import { Actionsheet, Divider } from "native-base"
import { Text, Button, ActionItem } from "../../../../../components"
import { color } from "../../../../../theme"
import { View } from "react-native"

interface Props {
  isOpen?: boolean,
  onClose?: Function
}

export const OwnershipAction = (props: Props) => {
  const sortOptions = [
    {
      label: 'CyStack',
      desc: 'Anyone in this group can view',
      value: 'cystack'
    },
    {
      label: 'duchm@cystack.net',
      desc: 'Only people added can view',
      value: 'duchm@cystack.net'
    }
  ]

  return (
    <Actionsheet
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <Actionsheet.Content>
        <View style={{ width: '100%', paddingHorizontal: 20 }}>
          <Text
            preset="semibold"
            text="Ownership"
            style={{
              fontSize: 18,
              marginBottom: 15
            }}
          />
        </View>

        <Divider borderColor={color.line} style={{ marginBottom: 10 }} />

        {
          sortOptions.map((item, index) => (
            <ActionItem
              key={index}
              icon="check"
              iconColor={color.palette.green}
            >
              <View>
                <Text
                  text={item.label}
                  style={{ color: color.textBlack }}
                />
                <Text
                  text={item.desc}
                  style={{ fontSize: 12 }}
                />
              </View>
            </ActionItem>
          ))
        }

        <View style={{ width: '100%', paddingHorizontal: 20, marginTop: 30 }}>
          <Button
            isNativeBase
            text="Save"
          />
        </View>
      </Actionsheet.Content>
    </Actionsheet>
  )
}