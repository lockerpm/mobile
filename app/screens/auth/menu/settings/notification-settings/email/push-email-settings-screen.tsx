import React, { useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from 'react-native'
import { Layout, Header } from "../../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../../../../models"
import { SectionWrapperItem, SettingSwipeItem } from "../../settings-item"
import { useMixins } from "../../../../../../services/mixins"
import { NotificationCategory } from "../../../../../../config/types"


export const PushEmailSettingsScreen = observer(function PushEmailSettingsScreen() {
  const navigation = useNavigation()
  const { user } = useStores()
  const { translate, color, notifyApiError } = useMixins()

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
    user.notificationSettings.forEach(e => {
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
    <Layout
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('common.email')}
          right={(<View style={{ width: 30 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >

      {/** all email setting */}
      {/* <SectionWrapperItem>
        <SettingSwipeItem
          noBorder
          name={translate('common.email')}
          value={allEmail}
          onValueChange={setAllEmail}
        />
      </SectionWrapperItem> */}
      {/** all email setting end */}

      <SectionWrapperItem>
        <SettingSwipeItem
          disabled={enable}
          name={translate('noti_setting.item_sharing')}
          value={shareEmail && enable}
          onValueChange={(val) => {
            setShareEmail(val)
            update(NotificationCategory.ITEM_SHARE, val)
          }}
        />
        <SettingSwipeItem
          disabled={enable}
          name={translate('noti_setting.emergency')}
          value={emergencyEmail && enable}
          onValueChange={(val) => {
            setEmergencyEmail(val)
            update(NotificationCategory.EMERGENCY, val)
          }}
        />
        <SettingSwipeItem
          disabled={enable}
          name={translate('noti_setting.breach_scan')}
          value={dataBreachEmail && enable}
          onValueChange={(val) => {
            setDataBreachEmail(val)
            update(NotificationCategory.DATA_BREACH, val)
          }}
        />
        <SettingSwipeItem
          disabled={enable}
          name={translate('noti_setting.tips')}
          value={pwTipEmail && enable}
          onValueChange={(val) => {
            setPwTipEmail(val)
            update(NotificationCategory.PW_TIPS, val)
          }}
        />
        <SettingSwipeItem
          disabled={enable}
          name={translate('noti_setting.marketing')}
          value={marketingEmail && enable}
          onValueChange={(val) => {
            setMarketingEmail(val)
            update(NotificationCategory.MARKETING, val)
          }}
        />
        <SettingSwipeItem
          disabled={enable}
          name={translate('common.other')}
          value={otherEmail && enable}
          onValueChange={(val) => {
            setOtherEmail(val)
            update(NotificationCategory.OTHER, val)
          }}
        />
      </SectionWrapperItem>
    </Layout>
  )
})
