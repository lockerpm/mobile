import React, { useState } from "react"
import { Actionsheet, Divider } from "native-base"
import { Text, AutoImage as Image, ActionItem, OwnershipAction } from "../../../../../components"
import { color, commonStyles } from "../../../../../theme"
import { View, ScrollView } from "react-native"
import { BROWSE_ITEMS } from "../../../../../common/mappings"


type Props = {
  isOpen?: boolean,
  onClose?: Function,
  navigation: any
}


export const PasswordAction = (props: Props) => {
  const { navigation, isOpen, onClose } = props
  const [showOwnershipAction, setShowOwnershipAction] = useState(false)

  return (
    <View>
      <OwnershipAction
        isOpen={showOwnershipAction}
        onClose={() => setShowOwnershipAction(false)}
      />

      <Actionsheet
        isOpen={isOpen}
        onClose={onClose}
      >
        <Actionsheet.Content>
          <View style={{ width: '100%', paddingHorizontal: 20 }}>
            <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
              <Image
                source={BROWSE_ITEMS.password.icon}
                style={{ height: 40, width: 40, marginRight: 10 }}
              />
              <View>
                <Text
                  preset="semibold"
                  text="gate.io"
                />
                <Text
                  text="duchm"
                  style={{ fontSize: 12 }}
                />
              </View>
            </View>
          </View>

          <Divider borderColor={color.line} marginBottom={1} marginTop={5} />

          <ScrollView
            style={{ width: '100%' }}
          >
            <ActionItem
              name="Launch Website"
              icon="external-link"
            />

            <ActionItem
              name="Copy Email or Username"
              icon="copy"
            />

            <ActionItem
              name="Copy Password"
              icon="copy"
            />

            <Divider borderColor={color.line} marginY={1} />

            <ActionItem
              name="Move to Folder"
              icon="folder-o"
              action={() => {
                onClose()
                navigation.navigate('folders__select', { mode: 'move' })
              }}
            />

            <ActionItem
              name="Change Ownership"
              icon="user-o"
              action={() => {
                onClose()
                setTimeout(() => setShowOwnershipAction(true), 500)
              }}
            />

            <Divider borderColor={color.line}  marginY={1} />

            <ActionItem
              name="Edit"
              icon="edit"
              action={() => {
                onClose()
                navigation.navigate('passwords__edit', { mode: 'edit' })
              }}
            />

            <ActionItem
              name="Share"
              icon="share-square-o"
            />

            <ActionItem
              name="Move to Trash"
              icon="trash"
              textColor={color.error}
            />
          </ScrollView>
        </Actionsheet.Content>
      </Actionsheet>
    </View>
  )
}