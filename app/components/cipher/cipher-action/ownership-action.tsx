import * as React from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { color, fontSize } from "../../../theme"
import { ActionItem } from "./action-item"
import { Button } from "../../button/button"
import { Text } from "../../text/text"
import { ActionSheet, ActionSheetContent } from "../../action-sheet"
import { Divider } from "../../divider/divider"

export interface OwnershipActionProps {
  isOpen?: boolean,
  onClose?: () => void
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
    <ActionSheet
      isOpen={isOpen}
      onClose={onClose}
    >
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


      <ActionSheetContent>
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
      </ActionSheetContent>

      <View style={{ width: '100%', paddingHorizontal: 20, marginVertical: 30 }}>
        <Button
          text="Save"
        />
      </View>
    </ActionSheet>
  )
})
