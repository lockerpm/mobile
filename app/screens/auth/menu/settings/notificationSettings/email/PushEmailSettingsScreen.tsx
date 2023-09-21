/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { NotificationCategory } from "app/static/types"
import { Screen, Header, Toggle } from "app/components-v2/cores"
import { translate } from "i18n-js"
import { MenuItemContainer, SettingsItem } from "app/components-v2/utils"

export const PushEmailSettingsScreen = observer(() => {
  const navigation = useNavigation()
  const { user } = useStores()
  const { colors } = useTheme()
  const { notifyApiError } = useHelper()

  // ----------------------- PARAMS -----------------------

  const [shareEmail, setShareEmail] = useState(false)
  const [emergencyEmail, setEmergencyEmail] = useState(false)
  const [dataBreachEmail, setDataBreachEmail] = useState(false)
  const [pwTipEmail, setPwTipEmail] = useState(false)
  const [marketingEmail, setMarketingEmail] = useState(false)
  const [otherEmail, setOtherEmail] = useState(false)
  const [enable, setEnableEmail] = useState(true)

  const settings = useRef({}).current
  // ----------------------- METHODS -----------------------
  const update = async (category: string, EmailEnable: boolean) => {
    await user.updateNotiSettings(category, EmailEnable, settings[category].noti)
  }

  // ----------------------- EFFECT -------------------------
  useEffect(() => {
    const fetchUserNotiSetting = async () => {
      const res = await user.getNotificationSettings()
      if (res.kind !== 'ok') {
        notifyApiError(res)
      }
    }
    fetchUserNotiSetting()
  }, [])

  useEffect(() => {
    user.notificationSettings?.forEach(e => {
      switch (e.category.id) {
        case NotificationCategory.ITEM_SHARE:
          settings[NotificationCategory.ITEM_SHARE] = { noti: e.notification, mail: e.mail }
          setShareEmail(e.mail)
          break
        case NotificationCategory.EMERGENCY:
          settings[NotificationCategory.EMERGENCY] = { noti: e.notification, mail: e.mail }
          setEmergencyEmail(e.mail)
          break
        case NotificationCategory.DATA_BREACH:
          settings[NotificationCategory.DATA_BREACH] = { noti: e.notification, mail: e.mail }
          setDataBreachEmail(e.mail)
          break
        case NotificationCategory.PW_TIPS:
          settings[NotificationCategory.PW_TIPS] = { noti: e.notification, mail: e.mail }
          setPwTipEmail(e.mail)
          break
        case NotificationCategory.MARKETING:
          settings[NotificationCategory.MARKETING] = { noti: e.notification, mail: e.mail }
          setMarketingEmail(e.mail)
          break
        case NotificationCategory.OTHER:
          settings[NotificationCategory.OTHER] = { noti: e.notification, mail: e.mail }
          setOtherEmail(e.mail)
          break
      }
    })
  }, [user.notificationSettings])
  // ----------------------- RENDER -----------------------

  return (
    <Screen
      padding
      preset="auto"
      header={(
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={translate('common.email')}
        />
      )}
      backgroundColor={colors.block}
    >
      <MenuItemContainer>

        <SettingsItem
          disabled={enable}
          name={translate('noti_setting.item_sharing')}
          RightAccessory={
            <Toggle
              variant='switch'
              value={shareEmail && enable}
              onValueChange={(val) => {
                setShareEmail(val)
                update(NotificationCategory.ITEM_SHARE, val)
              }}
            />
          }
        />
        <SettingsItem
          disabled={enable}
          name={translate('noti_setting.emergency')}
          RightAccessory={
            <Toggle
              variant='switch'
              value={emergencyEmail && enable}
              onValueChange={(val) => {
                setEmergencyEmail(val)
                update(NotificationCategory.EMERGENCY, val)
              }}
            />
          }
        />
        <SettingsItem
          disabled={enable}
          name={translate('noti_setting.breach_scan')}
          RightAccessory={
            <Toggle
              variant='switch'
              value={dataBreachEmail && enable}
              onValueChange={(val) => {
                setDataBreachEmail(val)
                update(NotificationCategory.DATA_BREACH, val)
              }}
            />
          }
        />
        <SettingsItem
          disabled={enable}
          name={translate('noti_setting.tips')}
          RightAccessory={
            <Toggle
              variant='switch'
              value={pwTipEmail && enable}
              onValueChange={(val) => {
                setPwTipEmail(val)
                update(NotificationCategory.PW_TIPS, val)
              }}
            />
          }
        />
        <SettingsItem
          disabled={enable}
          name={translate('noti_setting.marketing')}

        />
        <SettingsItem
          disabled={enable}
          name={translate('common.other')}
          RightAccessory={
            <Toggle
              variant='switch'
              value={otherEmail && enable}
              onValueChange={(val) => {
                setOtherEmail(val)
                update(NotificationCategory.OTHER, val)
              }}
            />
          }
        />
      </MenuItemContainer>
    </Screen>
  )
})
