import React from "react"
import { useNavigation } from "@react-navigation/native"
import { NotificationCategory } from "../../../../config/types"
import { AutoImage as Image, Text } from "../../../../components"
import { Linking, TouchableOpacity, View } from "react-native"
import { relativeTime } from "../../../../utils/relative-time"
import { useMixins } from "../../../../services/mixins"
import { useStores } from "../../../../models"

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
  const { type, title, description, lang, id, metadata, read, publish_time } = props
  const navigation = useNavigation()
  const { translate, notifyApiError } = useMixins()
  const { user, toolStore } = useStores()

  const markRead = async () => {
    const res = await toolStore.markReadInAppNoti(id)
    if (res.kind !== "ok") {
      notifyApiError(res)
    }
  }
  const property = (() => {
    let title;
    let source;
    let onPress;
    switch (type) {
      case NotificationCategory.ITEM_SHARE:
        title = translate('noti_setting.item_sharing')
        source = require('./assets/share-item.png')
        onPress = async () => {
          await markRead()
          navigation.navigate('mainTab', {
            screen: 'browseTab',
          })
          navigation.navigate('mainTab', {
            screen: 'browseTab',
            params: {
              screen: 'sharedItems'
            }
          })
        }
        break
      case NotificationCategory.EMERGENCY:
        title = translate('noti_setting.emergency')
        source = require('./assets/emergency.png')
        onPress = () => {
          const { is_grantor } = metadata
          if (is_grantor === undefined) {
            navigation.navigate('emergencyAccess')
          } else {
            navigation.navigate(is_grantor ? 'yourTrustedContact' : 'contactsTrustedYou')
          }

        }
        break
      case NotificationCategory.DATA_BREACH:
        source = require('./assets/breach-scan.png')
        onPress = () => { }
        break
      case NotificationCategory.MARKETING:
        source = require('./assets/marketing.png')
        onPress = () => { }
        break
      case NotificationCategory.PW_TIPS:
        title = translate('noti_setting.tips')
        source = require('./assets/pw-tips.png')
        onPress = () => { 
          const { link } = metadata
          Linking.openURL(link[user.language])
        }
        break
    }

    return {
      title,
      source,
      onPress
    }
  })()

  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        maxHeight: 108,
        flex: 1
      }}
      onPress={property.onPress}
    >
      <Image source={property.source} style={{ width: 40, height: 40 }} />
      <View style={{ marginLeft: 16, flex: 1 }}>
        <Text preset="bold" text={property.title} style={{ marginBottom: 4 }} />

        <Text
          preset="black"
          text={title[lang]}
          ellipsizeMode="tail"
          numberOfLines={3}
          style={{ marginBottom: 4, maxHeight: 60 }} />
        <Text text={relativeTime(publish_time * 1000, lang)} />
      </View>
    </TouchableOpacity>
  )
}