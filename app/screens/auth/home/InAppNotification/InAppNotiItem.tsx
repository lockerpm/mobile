import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { Linking, TouchableOpacity, View } from 'react-native'
import { relativeTime } from 'app/utils/utils'
import { NotificationCategory } from 'app/static/types'
import { useHelper } from 'app/services/hook'
import { translate } from 'app/i18n'
import { useStores } from 'app/models'
import { ImageIcon, ImageIconTypes, Text } from 'app/components/cores'

interface Props {
  lang: string
  description: any
  id: string
  type: NotificationCategory
  metadata: any
  title: any
  read: boolean
  publish_time: number
}
export const NotiListItem = (props: Props) => {
  const { type, title, lang, id, metadata, publish_time } = props
  const navigation = useNavigation()
  const { notifyApiError } = useHelper()
  const { user, toolStore } = useStores()

  const markRead = async () => {
    const res = await toolStore.markReadInAppNoti(id)
    if (res.kind !== 'ok') {
      notifyApiError(res)
    }
  }

  const property: {
    title?: string
    icon: ImageIconTypes
    onPress?: () => void
  } = (() => {
    switch (type) {
      case NotificationCategory.ITEM_SHARE:
        return {
          title: translate('noti_setting.item_sharing'),
          icon: 'share-item',
          onPress: async () => {
            await markRead()
            navigation.navigate('mainTab', {
              screen: 'browseTab',
            })
            navigation.navigate('mainTab', {
              screen: 'browseTab',
              params: {
                screen: 'sharedItems',
              },
            })
          },
        }
      case NotificationCategory.EMERGENCY:
        return {
          title: translate('noti_setting.emergency'),
          icon: 'emergency',
          onPress: async () => {
            const { is_grantor } = metadata
            if (is_grantor === undefined) {
              navigation.navigate('emergencyAccess')
            } else {
              navigation.navigate(is_grantor ? 'yourTrustedContact' : 'contactsTrustedYou')
            }
          },
        }
      case NotificationCategory.DATA_BREACH:
        return {
          icon: 'data-breach-scanner',
        }
      case NotificationCategory.MARKETING:
        return {
          icon: 'marketing',
        }
      case NotificationCategory.PW_TIPS:
        return {
          title: translate('noti_setting.tips'),
          icon: 'pw-tips',
          onPress: async () => {
            const { link } = metadata
            Linking.openURL(link[user.language])
          },
        }
    }
  })()

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        maxHeight: 108,
        flex: 1,
      }}
      onPress={property.onPress}
    >
      <ImageIcon icon={property.icon} size={40} />
      <View style={{ marginLeft: 16, flex: 1 }}>
        <Text preset="bold" text={property.title} style={{ marginBottom: 4 }} />

        <Text
          text={title[lang]}
          ellipsizeMode="tail"
          numberOfLines={3}
          style={{ marginBottom: 4, maxHeight: 60 }}
        />
        <Text preset="label" text={relativeTime(publish_time * 1000, lang)} />
      </View>
    </TouchableOpacity>
  )
}
