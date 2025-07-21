import { FC, useCallback, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { NotificationCategory } from "app/static/types"
import { Screen, Header, Switch } from "app/components/cores"
import { MenuItemContainer, SettingsItem } from "app/components/utils"
import { NotificationSettingsScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"
import { ViewStyle } from "react-native"
import { useAppTheme } from "@/utils/useAppTheme"

type AppNotiType = {
  [key in NotificationCategory]: boolean
}

export const PushEmailSettingsScreen: FC<NotificationSettingsScreenProps<"emailNoti">> = observer(
  ({ navigation }) => {
    const { user } = useStores()
    const {
      theme: { colors },
    } = useAppTheme()
    const { notifyApiError } = useToast()

    // ----------------------- PARAMS -----------------------

    const [settings, setSettings] = useState<AppNotiType>({
      item_sharing: false,
      emergency_access: false,
      data_breach: false,
      password_tip_trick: false,
      marketing: false,
      payment: false,
      other: false,
    })

    // stored config for email notifications
    const notiRef = useRef<AppNotiType>({
      item_sharing: false,
      emergency_access: false,
      data_breach: false,
      password_tip_trick: false,
      marketing: false,
      payment: false,
      other: false,
    })

    // ----------------------- METHODS -----------------------
    const update = async (category: NotificationCategory, emailEnable: boolean) => {
      const res = await user.updateNotiSettings(category, emailEnable, notiRef.current[category])
      if (res.kind === "ok") {
        setSettings((prev) => ({ ...prev, [category]: emailEnable }))
      } else {
        notifyApiError(res)
      }
    }

    const fetchUserNotiSetting = useCallback(async () => {
      const current: AppNotiType = {
        item_sharing: false,
        emergency_access: false,
        data_breach: false,
        password_tip_trick: false,
        marketing: false,
        payment: false,
        other: false,
      }
      const res = await user.getNotificationSettings()
      if (res.kind === "ok") {
        res.data.forEach((e) => {
          switch (e.category.id) {
            case NotificationCategory.ITEM_SHARE:
              current.item_sharing = e.mail
              notiRef.current.item_sharing = e.notification
              break
            case NotificationCategory.EMERGENCY:
              current.emergency_access = e.mail
              notiRef.current.emergency_access = e.notification
              break
            case NotificationCategory.DATA_BREACH:
              current.data_breach = e.mail
              notiRef.current.data_breach = e.notification
              break
            case NotificationCategory.PW_TIPS:
              current.password_tip_trick = e.mail
              notiRef.current.password_tip_trick = e.notification
              break
            case NotificationCategory.MARKETING:
              current.marketing = e.mail
              notiRef.current.marketing = e.notification
              break
            case NotificationCategory.OTHER:
              current.other = e.mail
              notiRef.current.other = e.notification
              break
          }
        })
        setSettings(current)
      } else {
        notifyApiError(res)
      }
    }, [])

    // ----------------------- EFFECT -------------------------
    useEffect(() => {
      fetchUserNotiSetting()
    }, [])

    // ----------------------- RENDER -----------------------

    return (
      <Screen
        preset="auto"
        header={
          <Header leftIcon="arrow-left" onLeftPress={navigation.goBack} titleTx={"common:email"} />
        }
        backgroundColor={colors.block}
        contentContainerStyle={$container}
      >
        <MenuItemContainer>
          <SettingsItem
            textTx={"noti_setting:item_sharing"}
            onPress={() => {
              update(NotificationCategory.ITEM_SHARE, !settings.item_sharing)
            }}
            RightAccessory={<Switch value={settings.item_sharing} />}
          />
          <SettingsItem
            textTx={"noti_setting:emergency"}
            onPress={() => {
              update(NotificationCategory.EMERGENCY, !settings.emergency_access)
            }}
            RightAccessory={<Switch value={settings.emergency_access} />}
          />
          <SettingsItem
            textTx={"noti_setting:breach_scan"}
            onPress={() => {
              update(NotificationCategory.DATA_BREACH, !settings.data_breach)
            }}
            RightAccessory={<Switch value={settings.data_breach} />}
          />
          <SettingsItem
            textTx={"noti_setting:tips"}
            onPress={() => {
              update(NotificationCategory.PW_TIPS, !settings.password_tip_trick)
            }}
            RightAccessory={<Switch value={settings.password_tip_trick} />}
          />
          <SettingsItem
            textTx={"noti_setting:marketing"}
            onPress={() => {
              update(NotificationCategory.MARKETING, !settings.marketing)
            }}
            RightAccessory={<Switch value={settings.marketing} />}
          />
          <SettingsItem
            textTx={"common:other"}
            onPress={() => {
              update(NotificationCategory.OTHER, !settings.other)
            }}
            RightAccessory={<Switch value={settings.other} />}
          />
        </MenuItemContainer>
      </Screen>
    )
  }
)

const $container: ViewStyle = {
  paddingHorizontal: 16,
}
