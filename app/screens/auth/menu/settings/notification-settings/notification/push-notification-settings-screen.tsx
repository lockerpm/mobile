import React, { useEffect, useRef, useState } from "react"
import { View } from 'react-native'
import { observer } from "mobx-react-lite"
import { Layout, Header } from "../../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../../../../models"
import { SectionWrapperItem, SettingSwipeItem } from "../../settings-item"
import { useMixins } from "../../../../../../services/mixins"
import { NotificationCategory } from "../../../../../../config/types"


export const PushNotificationSettingsScreen = observer(function PushNotificationSettingsScreen() {
  const navigation = useNavigation()
  const { user } = useStores()
  const { translate, color, notifyApiError } = useMixins()


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
    user.notificationSettings?.forEach(e => {
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
    <Layout
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('common.push_notifications')}
          right={(<View style={{ width: 30 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      {/* * Push notification setting */}
      {/* <SectionWrapperItem>
        <SettingSwipeItem
          noBorder
          name={translate('common.push_notifications')}
          value={enable}
          onValueChange={(val) => {
            setEnableNoti(val)
            updateAllNoti(val)
          }}
        />
      </SectionWrapperItem> */}
      {/** Push notification setting end */}

      {/* <SectionWrapperItem title={translate('noti_setting.in_app_noti')}> */}
      <SectionWrapperItem>
        <SettingSwipeItem
          disabled={enable}
          name={translate('noti_setting.item_sharing')}
          value={shareNoti && enable}
          onValueChange={(val) => {
            setShareNoti(val)
            update(NotificationCategory.ITEM_SHARE, val)
          }}
        />
        <SettingSwipeItem
          disabled={enable}
          name={translate('noti_setting.emergency')}
          value={emergencyNoti && enable}
          onValueChange={(val) => {
            setEmergencyNoti(val)
            update(NotificationCategory.EMERGENCY, val)
          }}
        />
        <SettingSwipeItem
          disabled={enable}
          name={translate('noti_setting.breach_scan')}
          value={dataBreachNoti && enable}
          onValueChange={(val) => {
            setDataBreachNoti(val)
            update(NotificationCategory.DATA_BREACH, val)
          }}
        />
        <SettingSwipeItem
          disabled={enable}
          name={translate('noti_setting.tips')}
          value={pwTipNoti && enable}
          onValueChange={(val) => {
            setPwTipNoti(val)
            update(NotificationCategory.PW_TIPS, val)
          }}
        />
        <SettingSwipeItem
          disabled={enable}
          name={translate('noti_setting.marketing')}
          value={marketingNoti && enable}
          onValueChange={(val) => {
            setMarketingNoti(val)
            update(NotificationCategory.MARKETING, val)
          }}
        />
      </SectionWrapperItem>
    </Layout>
  )
})
