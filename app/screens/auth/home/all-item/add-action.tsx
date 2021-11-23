import React from "react"
import { Text, AutoImage as Image, ActionSheet, ActionSheetItem, ActionSheetContent } from "../../../../components"
import { color as colorLight, colorDark, commonStyles } from "../../../../theme"
import { BROWSE_ITEMS } from "../../../../common/mappings"
import { View } from "react-native"
import { useStores } from "../../../../models"
import { observer } from "mobx-react-lite"

interface Props {
  isOpen?: boolean,
  onClose?: () => void,
  navigation?: any,
  defaultFolder?: string
}

export const AddAction = observer((props: Props) => {
  const { cipherStore, uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

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
                {
                  item.svgIcon ? (
                    <item.svgIcon height={40} width={40} />
                  ) : (
                    <Image
                      source={item.icon}
                      style={{ height: 40, width: 40 }}
                    />
                  )
                }
                <Text
                  tx={item.label}
                  style={{ color: color.textBlack, marginLeft: 12 }}
                />
              </View>
            </ActionSheetItem>
          ))
        }
      </ActionSheetContent>
    </ActionSheet>
  )
})
