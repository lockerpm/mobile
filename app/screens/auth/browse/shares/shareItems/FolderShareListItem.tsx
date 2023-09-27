import { Icon, ImageIcon, Text } from 'app/components/cores'
import { useTheme } from 'app/services/context'
import { CollectionView } from 'core/models/view/collectionView'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'

type Prop = {
  item: CollectionView
  openActionMenu: (val: any) => void
  navigation: any
  isOnlyView?: boolean
}

export const CollectionListItem = (props: Prop) => {
  const { item, openActionMenu, navigation } = props
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('folders__ciphers', {
          collectionId: item.id,
          organizationId: item.organizationId,
        })
      }}
      style={{
        borderBottomColor: colors.border,
        borderBottomWidth: 0.5,
        paddingVertical: 15,
        height: 70.5,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ImageIcon size={40} icon="folder-share" />

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text preset="bold" text={item.name} numberOfLines={1} />
              <Icon
                icon="dots-three"
                size={18}
                color={colors.title}
                onPress={() => openActionMenu(item)}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}
