import * as React from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { color, fontSize } from "../../../theme"
import { Actionsheet, Divider } from "native-base"
import { ActionItem } from "./action-item"
import { Button } from "../../button/button"
import { Text } from "../../text/text"

export interface OwnershipActionProps {
  isOpen?: boolean,
  onClose?: Function
}

/**
 * Describe your component here
 */
export const OwnershipAction = observer(function OwnershipAction(props: OwnershipActionProps) {
  const { isOpen, onClose } = props

  const owners = [
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
      isOpen={isOpen}
      onClose={onClose}
    >
      <Actionsheet.Content>
        <View style={{ width: '100%', paddingHorizontal: 20 }}>
          <Text
            preset="semibold"
            text="Ownership"
            style={{
              fontSize: fontSize.h4,
              marginBottom: 15
            }}
          />
        </View>

        <Divider borderColor={color.line} style={{ marginBottom: 10 }} />

        {
          owners.map((item, index) => (
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
                  style={{ fontSize: fontSize.small }}
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
})
