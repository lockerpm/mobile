import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { NotificationCategory } from "app/static/types"
import { Screen, Header, Toggle } from "app/components/cores"
import { MenuItemContainer, SettingsItem } from "app/components/utils"
import { NotificationSettingsScreenProps } from "../../route"

type AppNotiType = {
  [key in NotificationCategory]: boolean
}

export const PushNotificationSettingsScreen: FC<NotificationSettingsScreenProps<"deviceNoti">> =
  observer(({ navigation }) => {
    const { user } = useStores()
    const { colors } = useTheme()
    const { notifyApiError } = useHelper()

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
        padding
        preset="auto"
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx={"common.push_notifications"}
          />
        }
        backgroundColor={colors.block}
      >
        <MenuItemContainer>
          <SettingsItem
            textTx={"noti_setting.item_sharing"}
            RightAccessory={
              <Toggle
                variant="switch"
                value={settings.item_sharing}
                onValueChange={(val) => {
                  update(NotificationCategory.ITEM_SHARE, val)
                }}
              />
            }
          />
          <SettingsItem
            textTx={"noti_setting.emergency"}
            RightAccessory={
              <Toggle
                variant="switch"
                value={settings.emergency_access}
                onValueChange={(val) => {
                  update(NotificationCategory.EMERGENCY, val)
                }}
              />
            }
          />
          <SettingsItem
            textTx={"noti_setting.breach_scan"}
            RightAccessory={
              <Toggle
                variant="switch"
                value={settings.data_breach}
                onValueChange={(val) => {
                  update(NotificationCategory.DATA_BREACH, val)
                }}
              />
            }
          />
          <SettingsItem
            textTx={"noti_setting.tips"}
            RightAccessory={
              <Toggle
                variant="switch"
                value={settings.password_tip_trick}
                onValueChange={(val) => {
                  update(NotificationCategory.PW_TIPS, val)
                }}
              />
            }
          />
          <SettingsItem
            textTx={"noti_setting.marketing"}
            RightAccessory={
              <Toggle
                variant="switch"
                value={settings.marketing}
                onValueChange={(val) => {
                  update(NotificationCategory.MARKETING, val)
                }}
              />
            }
          />
        </MenuItemContainer>
      </Screen>
    )
  })
