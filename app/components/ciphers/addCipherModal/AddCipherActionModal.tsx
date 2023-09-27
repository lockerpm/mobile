import React from 'react'
import { useStores } from 'app/models'
import { BROWSE_ITEMS } from 'app/navigators'
import { CollectionView } from 'core/models/view/collectionView'
import { ActionSheet } from '../actionsSheet/ActionSheet'
import { TouchableOpacity, View, Image } from 'react-native'
import { Text } from '../../cores'

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
              mode: 'add',
              collection: collection,
            })
          }}
        >
          <View style={{ flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 20 }}>
            <Image source={item.icon} style={{ height: 40, width: 40 }} />
            <Text tx={item.label} style={{ marginLeft: 12 }} />
          </View>
        </TouchableOpacity>
      ))}
    </ActionSheet>
  )
}
