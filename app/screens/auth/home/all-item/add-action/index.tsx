import React from "react"
import { Text, AutoImage as Image, ActionSheet, ActionSheetItem, ActionSheetContent } from "../../../../../components"
import { commonStyles } from "../../../../../theme"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { View } from "react-native"
import { useStores } from "../../../../../models"
import { observer } from "mobx-react-lite"
import { useMixins } from "../../../../../services/mixins"
import { CollectionView } from "../../../../../../core/models/view/collectionView"

interface Props {
  isOpen: boolean,
  onClose: () => void,
  navigation: any,
  defaultFolder?: string
  collection?: CollectionView
}

export const AddAction = observer((props: Props) => {
  const { isOpen, onClose, navigation, defaultFolder, collection } = props
  const { color } = useMixins()
  const { cipherStore } = useStores()

  const items = Object.values(BROWSE_ITEMS).filter(item => item.addable && !item.group)
  
  const handleClose = () => {
    onClose()
  }

  return (
    <>
      <ActionSheet
        isOpen={isOpen}
        onClose={handleClose}
      >
        <ActionSheetContent>
          {
            items.map((item, index) => (
              <ActionSheetItem
                key={index}
                border={index !== items.length - 1}
                onPress={() => {
                  if (defaultFolder) {
                    cipherStore.setSelectedFolder(defaultFolder)
                  } else {
                    cipherStore.setSelectedFolder(null)
                  }
                  onClose()
                  navigation.navigate(`${item.routeName}__edit`, {
                    mode: 'add',
                    collection: collection
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
    </>
  )
})
