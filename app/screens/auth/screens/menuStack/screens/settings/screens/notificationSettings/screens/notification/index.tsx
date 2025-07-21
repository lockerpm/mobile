import { FC, useCallback, useEffect, useRef, useState } from "react"
import { useStores } from "app/models"
import { NotificationCategory } from "app/static/types"
import { Screen, Header, Switch } from "app/components/cores"
import { MenuItemContainer, SettingsItem } from "app/components/utils"
import { NotificationSettingsScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"
import { useAppTheme } from "@/utils/useAppTheme"
import { ViewStyle } from "react-native"

type AppNotiType = {
  [key in NotificationCategory]: boolean
}

export const PushNotificationSettingsScreen: FC<NotificationSettingsScreenProps<"deviceNoti">> = ({
  navigation,
}) => {
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
  const emailRef = useRef<AppNotiType>({
    item_sharing: false,
    emergency_access: false,
    data_breach: false,
    password_tip_trick: false,
    marketing: false,
    payment: false,
    other: false,
  })
  // ----------------------- METHODS -----------------------
  const update = async (category: NotificationCategory, notiEnable: boolean) => {
    const res = await user.updateNotiSettings(category, emailRef.current[category], notiEnable)
    if (res.kind === "ok") {
      setSettings((prev) => ({ ...prev, [category]: notiEnable }))
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
            current.item_sharing = e.notification
            emailRef.current.item_sharing = e.mail
            break
          case NotificationCategory.EMERGENCY:
            current.emergency_access = e.notification
            emailRef.current.emergency_access = e.mail
            break
          case NotificationCategory.DATA_BREACH:
            current.data_breach = e.notification
            emailRef.current.data_breach = e.mail
            break
          case NotificationCategory.PW_TIPS:
            current.password_tip_trick = e.notification
            emailRef.current.password_tip_trick = e.mail
            break
          case NotificationCategory.MARKETING:
            current.marketing = e.notification
            emailRef.current.marketing = e.mail
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
        <Header
          leftIcon="arrow-left"
          onLeftPress={navigation.goBack}
          titleTx={"common:push_notifications"}
        />
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
      </MenuItemContainer>
    </Screen>
  )
}

const $container: ViewStyle = {
  paddingHorizontal: 16,
}
