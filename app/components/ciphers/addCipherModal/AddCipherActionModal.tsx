import React from "react"
import { useStores } from "app/models"
import { CollectionView } from "core/models/view/collectionView"
import { ActionSheet } from "../actionsSheet/ActionSheet"
import { TouchableOpacity, View, Image } from "react-native"
import { Text } from "../../cores"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"

interface Props {
  isOpen: boolean
  onClose: () => void
  navigation: any
  defaultFolder?: string
  collection?: CollectionView
}

export const AddCipherActionModal = (props: Props) => {
  const { isOpen, onClose, navigation, defaultFolder, collection } = props
  const { cipherStore } = useStores()

  const items = Object.values(BROWSE_ITEMS).filter((item) => item.addable && !item.group)

  return (
    <ActionSheet isOpen={isOpen} onClose={onClose}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            if (defaultFolder) {
              cipherStore.setSelectedFolder(defaultFolder)
            } else {
              cipherStore.setSelectedFolder(null)
            }
            onClose()
            navigation.navigate(`${item.routeName}__edit`, {
              mode: "add",
              collection,
            })
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 20,
            }}
          >
            <Image source={item.icon} style={{ height: 40, width: 40 }} resizeMode="contain" />
            <Text tx={item.label} style={{ marginLeft: 12 }} />
          </View>
        </TouchableOpacity>
      ))}
    </ActionSheet>
  )
}
