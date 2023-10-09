/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native'
import { useStores } from 'app/models'
import { useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { NotificationCategory } from 'app/static/types'
import { Screen, Header, Toggle } from 'app/components/cores'
import { MenuItemContainer, SettingsItem } from 'app/components/utils'
import { translate } from 'app/i18n'

export const PushNotificationSettingsScreen = observer(() => {
  const navigation = useNavigation()
  const { user } = useStores()
  const { colors } = useTheme()
  const { notifyApiError } = useHelper()

  // ----------------------- PARAMS -----------------------

  const [shareNoti, setShareNoti] = useState(false)
  const [emergencyNoti, setEmergencyNoti] = useState(false)
  const [dataBreachNoti, setDataBreachNoti] = useState(false)
  const [pwTipNoti, setPwTipNoti] = useState(false)
  const [marketingNoti, setMarketingNoti] = useState(false)
  const [enable, setEnableNoti] = useState(true)
  const settings = useRef({}).current

  // ----------------------- METHODS -----------------------
  const update = async (category: string, notiEnable: boolean) => {
    await user.updateNotiSettings(category, settings[category].mail, notiEnable)
  }

  const updateAllNoti = async (val: boolean) => {
    await update(NotificationCategory.ITEM_SHARE, val)
    await update(NotificationCategory.EMERGENCY, val)
    await update(NotificationCategory.DATA_BREACH, val)
    await update(NotificationCategory.PW_TIPS, val)
    await update(NotificationCategory.MARKETING, val)
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
    user.notificationSettings?.forEach((e) => {
      switch (e.category.id) {
        case NotificationCategory.ITEM_SHARE:
          settings[NotificationCategory.ITEM_SHARE] = { noti: e.notification, mail: e.mail }
          setShareNoti(e.notification)
          break
        case NotificationCategory.EMERGENCY:
          settings[NotificationCategory.EMERGENCY] = { noti: e.notification, mail: e.mail }
          setEmergencyNoti(e.notification)
          break
        case NotificationCategory.DATA_BREACH:
          settings[NotificationCategory.DATA_BREACH] = { noti: e.notification, mail: e.mail }
          setDataBreachNoti(e.notification)
          break
        case NotificationCategory.PW_TIPS:
          settings[NotificationCategory.PW_TIPS] = { noti: e.notification, mail: e.mail }
          setPwTipNoti(e.notification)
          break
        case NotificationCategory.MARKETING:
          settings[NotificationCategory.MARKETING] = { noti: e.notification, mail: e.mail }
          setMarketingNoti(e.notification)
          break
      }
    })
  }, [user.notificationSettings])

  // ----------------------- RENDER -----------------------

  return (
    <Screen
      padding
      preset="auto"
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={translate('common.push_notifications')}
        />
      }
      backgroundColor={colors.block}
    >
      <MenuItemContainer>
        <SettingsItem
          disabled={enable}
          name={translate('noti_setting.item_sharing')}
          RightAccessory={
            <Toggle
              variant="switch"
              value={shareNoti && enable}
              onValueChange={(val) => {
                setShareNoti(val)
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
              variant="switch"
              value={emergencyNoti && enable}
              onValueChange={(val) => {
                setEmergencyNoti(val)
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
              variant="switch"
              value={dataBreachNoti && enable}
              onValueChange={(val) => {
                setDataBreachNoti(val)
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
              variant="switch"
              value={pwTipNoti && enable}
              onValueChange={(val) => {
                setPwTipNoti(val)
                update(NotificationCategory.PW_TIPS, val)
              }}
            />
          }
        />
        <SettingsItem
          disabled={enable}
          name={translate('noti_setting.marketing')}
          RightAccessory={
            <Toggle
              variant="switch"
              value={marketingNoti && enable}
              onValueChange={(val) => {
                setMarketingNoti(val)
                update(NotificationCategory.MARKETING, val)
              }}
            />
          }
        />
      </MenuItemContainer>
    </Screen>
  )
})
