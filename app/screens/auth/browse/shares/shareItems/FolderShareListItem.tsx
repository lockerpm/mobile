import { Icon, ImageIcon, Text } from 'app/components/cores'
import { useStores } from 'app/models'
import { useTheme } from 'app/services/context'
import { SharingStatus } from 'app/static/types'
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
  const {cipherStore} = useStores()
  const { colors } = useTheme()

  const needConfirmCount = (() => {
      const share = cipherStore.myShares.find((s) => s.id === item.organizationId)
      if (share) {
        let totial = 0
        share.members.forEach(m => {
          if (m.status === SharingStatus.ACCEPTED) {
            totial +=1
          }
        })

        return totial
      }
      return 0
  })()


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
              <TouchableOpacity 
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onPress={() => openActionMenu(item)}
              >
                {
                  needConfirmCount > 0 && (
                    <View style={{
                      marginRight: 4, borderRadius: 15,
                      width: 20,
                      height: 20,
                      backgroundColor: colors.error,
                      justifyContent: "center",
                      alignItems: "center"
                    }}>
                      <Text text={needConfirmCount.toString()} size="small" color={colors.white} preset="bold" />
                    </View>
                  )
                }
                <Icon
                icon="dots-three"
                size={18}
                color={colors.title}
              
              />
              </TouchableOpacity>
              
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}
