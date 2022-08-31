import React, { useEffect, useState } from "react"
import { View, TouchableOpacity, TextInput, Modal } from "react-native"
import { Button, Divider, Header, Icon, Layout, Text } from "../../../../../../components"
import { observer } from "mobx-react-lite"
import { commonStyles, fontSize } from "../../../../../../theme"
import { useMixins } from "../../../../../../services/mixins"
import { AppEventType, EventBus } from "../../../../../../utils/event-bus"
import CheckBox from "@react-native-community/checkbox"
import { EmergencyAccessType } from "../../../../../../config/types"
import { useCipherDataMixins } from "../../../../../../services/mixins/cipher/data"


interface InviteProps {
  isShow: boolean
  onClose: () => void
  onAction: () => void
}
export const AddTrustedContactModal = observer(function AddTrustedContactModal(props: InviteProps) {
  const { isShow, onClose } = props
  // const { user, cipherStore } = useStores()
  const { translate, color } = useMixins()
  const { inviteEA } = useCipherDataMixins()

  // ----------------------- PARAMS -----------------------
  const [email, setEmail] = useState<string>("");
  const [accessRight, setAccessRight] = useState(false) // false for view, true for takeover
  const [waitTime, setWaitTime] = useState(1)
  const [emailError, setEmailError] = useState("")
  const role = [
    {
      value: !accessRight,
      action: () => { setAccessRight(!accessRight) },
      text: translate("emergency_access.add.view")
    },
    {
      value: accessRight,
      action: () => { setAccessRight(!accessRight) },
      text: translate("emergency_access.add.takeover")
    }
  ]
  const time = [
    {
      value: 1,
      text: "1 " + translate("emergency_access.add.day")
    },
    {
      value: 3,
      text: "3 " + translate("emergency_access.add.day")
    },
    {
      value: 7,
      text: "7 " + translate("emergency_access.add.day")
    },
    {
      value: 14,
      text: "14 " + translate("emergency_access.add.day")
    },
    {
      value: 30,
      text: "30 " + translate("emergency_access.add.day")
    }
  ]
  // ----------------------- METHODS -----------------------
  const onAdd = async () => {
    if (!email.includes("@")) return
    const res = await inviteEA(email.toLowerCase(), accessRight ? EmergencyAccessType.TAKEOVER : EmergencyAccessType.VIEW, waitTime)
    if (res.kind === "ok") {
      onClose()
    }
    if (res.kind === 'exist-data') {
      setEmailError(translate('emergency_access.add.exist_error'))
    }
    if (res.kind === 'bad-data') {
      setEmailError(translate('error.invalid_data'))
    }
  }

  // ----------------------- EFFECTS -----------------------

  // Close on signal
  useEffect(() => {
    const listener = EventBus.createListener(AppEventType.CLOSE_ALL_MODALS, () => {
      onClose()
    })
    return () => {
      EventBus.removeListener(listener)
    }
  }, [])

  useEffect(() => {
    if (!isShow) {
      setEmail("")
      setAccessRight(false)
      setWaitTime(1)
    }
  }, [isShow])

  useEffect(() => {
    setEmailError("")
  }, [email])

  // ----------------------- RENDER -----------------------
  return (
    <Modal
      presentationStyle="pageSheet"
      visible={isShow}
      animationType="slide"
      onRequestClose={() => onClose()}
    >
      <Layout
        header={(
          <Header
            left={(
              <TouchableOpacity
                onPress={() => onClose()}>
                <Icon icon={"cross"} size={18} color={color.textBlack} />
              </TouchableOpacity>
            )}
            title={translate("emergency_access.add_trust")}
            right={(
              <Button
                isDisabled={!email}
                text={translate('common.add')}
                preset="link"
                onPress={onAdd}
              />
            )}
          />
        )}
      >
        <Text preset="semibold" text={translate("emergency_access.add.email")} />
        <View>
          <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
            borderColor: emailError !== "" ? color.error : color.line,
            backgroundColor: color.background,
            borderWidth: 1,
            borderRadius: 8,
            paddingLeft: 16,
            marginBottom: 10,
            marginTop: 12
          }]}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={"email@gmail.com"}
              placeholderTextColor={color.text}
              selectionColor={color.primary}
              style={{
                height: 44,
                color: color.textBlack,
                fontSize: fontSize.p,
                flex: 1
              }}
            />
          </View>
          <Text text={emailError} style={{ color: color.error, fontSize: fontSize.small }} />
        </View>


        {
          role.map((item, index) => (
            <View key={index}>
              <TouchableOpacity
                onPress={item.action}
                style={{ flexDirection: "row", marginVertical: 16 }}>
                <CheckBox
                  tintColors={{
                    true: color.primary, false: color.block
                  }}
                  onCheckColor={color.primary}
                  onTintColor={color.primary}
                  tintColor={color.block}
                  style={{ width: 24, height: 24 }}
                  value={item.value}
                  onValueChange={item.action}
                  onAnimationType="bounce"
                  offAnimationType="fade"
                />
                <Text preset="black" text={item.text} style={{ marginLeft: 12 }} />

              </TouchableOpacity>
              {index === 0 && <Divider />}
            </View>
          ))
        }

        <Text preset="semibold" text={translate("emergency_access.add.wait_time")} style={{ marginTop: 16 }} />
        <Text
          text={translate("emergency_access.add.text")}
          style={{ marginTop: 8, fontSize: fontSize.small }}
        />

        {
          time.map((item, index) => (
            <View key={index}>
              <TouchableOpacity
                onPress={() => { setWaitTime(item.value) }}
                style={{ flexDirection: "row", marginVertical: 16 }}
              >
                <CheckBox
                  tintColors={{
                    true: color.primary, false: color.block
                  }}
                  onCheckColor={color.primary}
                  onTintColor={color.primary}
                  tintColor={color.block}
                  style={{ width: 24, height: 24 }}
                  value={item.value === waitTime}
                  onValueChange={() => { setWaitTime(item.value) }}
                  onAnimationType="bounce"
                  offAnimationType="fade"
                />
                <Text preset="black" text={item.text} style={{ marginLeft: 12 }} />

              </TouchableOpacity>
              {index !== (time.length - 1) && <Divider />}
            </View>
          ))
        }

        {/* <Text
          text="* if they don’t have Locker account, they will be invited to created an account. Then you have to confirm again when they are done creating account to confirm them as your emergency contact"
          style={{ marginTop: 20, fontSize: 12 }}
        /> */}
      </Layout>
    </Modal >
  )
})
