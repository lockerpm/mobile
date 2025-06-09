import React from "react"
import { useNavigation } from "@react-navigation/native"
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native"
import { relativeTime } from "app/utils/utils"
import { AppNotificationType, NotificationCategory } from "app/static/types"
import { ImageIcon, ImageIconTypes, Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import { HomeStackScreenProps } from "app/navigators"
import { TxKeyPath } from "app/i18n"

interface Props {
  lang: "vi" | "en"
  item: AppNotificationType
  markRead: (id: string) => void
}

export const NotiListItem = ({
  lang,
  markRead,
  item: { type, title, id, metadata, publish_time, read },
}: Props) => {
  const navigation = useNavigation<HomeStackScreenProps<"appListNoti">["navigation"]>()
  const { colors } = useTheme()

  const property: {
    title: TxKeyPath
    icon: ImageIconTypes
    onPress?: () => void
  } | null = (() => {
    switch (type) {
      case NotificationCategory.ITEM_SHARE:
        return {
          title: "noti_setting.item_sharing",
          icon: "share-item",
          onPress: () => {
            // navigation.navigate("mainTab", {
            //   screen: "browseTab",
            //   params: {
            //     screen: "sharedItems",
            //   },
            // })
          },
        }
      case NotificationCategory.EMERGENCY:
        return {
          title: "noti_setting.emergency",
          icon: "emergency",
          onPress: async () => {
            const { is_grantor } = metadata
            if (is_grantor === undefined) {
              navigation.navigate("menuStack", {
                screen: "settingsStack",
                params: {
                  screen: "emergencyStack",
                  params: {
                    screen: "emergencyOptions",
                  },
                },
              })
            } else {
              navigation.navigate("menuStack", {
                screen: "settingsStack",
                params: {
                  screen: "emergencyStack",
                  params: {
                    screen: is_grantor ? "yourTrustedContact" : "contactsTrustedYou",
                  },
                },
              })
            }
          },
        }
      case NotificationCategory.DATA_BREACH:
        return {
          title: "noti_setting.breach_scan",
          icon: "data-breach-scanner",
        }
      case NotificationCategory.MARKETING:
        return {
          title: "noti_setting.marketing",
          icon: "marketing",
        }
      case NotificationCategory.PW_TIPS:
        return {
          title: "noti_setting.tips",
          icon: "pw-tips",
          onPress: async () => {
            const { link } = metadata
            if (link) {
              Linking.openURL(link[lang])
            }
          },
        }
      default:
        return null
    }
  })()

  return property ? (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderColor: colors.border,
          backgroundColor: read ? colors.block : colors.background,
          opacity: read ? 0.8 : 1,
        },
      ]}
      onPress={() => {
        markRead(id)
        property?.onPress && property.onPress()
      }}
    >
      <ImageIcon icon={property.icon} size={40} />

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text preset="bold" tx={property.title} style={styles.title} />
          <Text preset="label" text={relativeTime(publish_time * 1000, lang)} />
        </View>

        <Text text={title[lang]} style={styles.mb4} />
      </View>
    </TouchableOpacity>
  ) : null
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginVertical: 6,
    padding: 12,
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 16,
  },
  mb4: {
    marginBottom: 4,
  },
  title: {
    flexGrow: 1,
    flexShrink: 1,
    marginBottom: 4,
    marginRight: 8,
  },
  titleContainer: {
    alignContent: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
})
