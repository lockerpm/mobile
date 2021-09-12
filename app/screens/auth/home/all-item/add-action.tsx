import React from "react"
import { Text, AutoImage as Image, ActionSheet, ActionSheetItem, ActionSheetContent } from "../../../../components"
import { color, commonStyles } from "../../../../theme"
import { BROWSE_ITEMS } from "../../../../common/mappings"
import { View } from "react-native"
import { useStores } from "../../../../models"

interface Props {
  isOpen?: boolean,
  onClose?: () => void,
  navigation?: any,
  defaultFolder?: string
}

export const AddAction = (props: Props) => {
  const { cipherStore } = useStores()

  return (
    <ActionSheet
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <ActionSheetContent>
        {
          Object.values(BROWSE_ITEMS).filter(item => item.addable).map((item, index) => (
            <ActionSheetItem
              key={index}
              border
              onPress={() => {
                props.onClose()
                if (props.defaultFolder) {
                  cipherStore.setSelectedFolder(props.defaultFolder)
                }
                props.navigation.navigate(`${item.routeName}__edit`, {
                  mode: 'add'
                })
              }}
            >
              <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
                <Image
                  source={item.icon}
                  style={{ height: 40, marginRight: 12 }}
                />
                <Text
                  text={item.label}
                  style={{ color: color.textBlack }}
                />
              </View>
            </ActionSheetItem>
          ))
        }
      </ActionSheetContent>
    </ActionSheet>
  )
}
