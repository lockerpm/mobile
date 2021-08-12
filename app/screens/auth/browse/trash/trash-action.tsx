import React, { useState } from "react"
import { Actionsheet, Divider } from "native-base"
import { Text, AutoImage as Image, ActionItem } from "../../../../components"
import { color, commonStyles } from "../../../../theme"
import { View, ScrollView } from "react-native"
import { BROWSE_ITEMS } from "../../../../common/mappings"
import { DeleteConfirmModal } from "./delete-confirm-modal"


type Props = {
  isOpen?: boolean,
  onClose?: Function
}


export const TrashAction = (props: Props) => {
  const { isOpen, onClose } = props
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <View>
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
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
              name="Edit"
              icon="edit"
            />

            <ActionItem
              name="Restore"
              icon="repeat"
            />

            <ActionItem
              name="Delete Permanently"
              icon="trash"
              textColor={color.error}
              action={() => setShowDeleteConfirm(true)}
            />
          </ScrollView>
        </Actionsheet.Content>
      </Actionsheet>
    </View>
  )
}