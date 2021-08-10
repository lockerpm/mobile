import React from "react"
import { Actionsheet, Divider } from "native-base"
import { Text, AutoImage as Image } from "../../../../../components"
import { color, commonStyles } from "../../../../../theme"
import { View, ScrollView } from "react-native"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'


type Props = {
  isOpen?: boolean,
  onClose?: Function,
  navigation: any
}

type ActionItemProps = {
  name: string,
  icon: string,
  color?: string,
  action?: Function
}


export const PasswordAction = (props: Props) => {
  const { navigation, isOpen, onClose } = props

  const ActionItem = (actionProps: ActionItemProps) => {
    const {
      icon,
      name,
      action
    } = actionProps

    return (
      <Actionsheet.Item
        onPress={() => action && action()}
        endIcon={(
          <FontAwesomeIcon 
            name={icon}
            size={18} 
            color={actionProps.color || color.text}
          />
        )}
        _stack={{
          style: {
            flex: 1,
            justifyContent: 'space-between'
          }
        }}
      >
        <Text
          text={name}
          style={{ color: actionProps.color || color.textBlack }}
        />
      </Actionsheet.Item>
    )
  }

  return (
    <View>
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
                navigation.navigate('folders__action', { mode: 'move' })
              }}
            />

            <ActionItem
              name="Change Ownership"
              icon="user-o"
              action={() => {
                onClose()
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
              color={color.error}
            />
          </ScrollView>
        </Actionsheet.Content>
      </Actionsheet>
    </View>
  )
}