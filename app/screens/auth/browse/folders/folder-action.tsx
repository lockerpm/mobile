import React, { useState } from "react"
import { Actionsheet, Divider } from "native-base"
import { Text, AutoImage as Image, ActionItem, OwnershipAction } from "../../../../components"
import { color, commonStyles } from "../../../../theme"
import { View, ScrollView } from "react-native"
import { FOLDER_IMG } from "../../../../common/mappings"


type Props = {
  isOpen?: boolean,
  onClose?: Function,
  rename: Function
}


export const FolderAction = (props: Props) => {
  const { isOpen, onClose, rename } = props
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
                source={FOLDER_IMG.share.img}
                style={{ height: 30, marginRight: 10 }}
              />
              <View>
                <Text
                  preset="semibold"
                  text="Shared - Family (2)"
                />
              </View>
            </View>
          </View>

          <Divider borderColor={color.line} marginBottom={1} marginTop={5} />

          <ScrollView
            style={{ width: '100%' }}
          >
            <ActionItem
              name="Rename"
              icon="edit"
              action={() => {
                onClose()
                setTimeout(() => {
                  rename && rename()
                }, 500)
              }}
            />

            <ActionItem
              name="Delete Folder"
              icon="trash"
              textColor={color.error}
            />
          </ScrollView>
        </Actionsheet.Content>
      </Actionsheet>
    </View>
  )
}