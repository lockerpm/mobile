import React, { useEffect, useState } from "react"
import { View, TouchableOpacity, Modal } from "react-native"
import { observer } from "mobx-react-lite"
import { Button, Header, Screen, Text, Toggle, TextInput } from "app/components/cores"
import { useTheme } from "app/services/context"
import { useCipherData, useHelper } from "app/services/hook"
import { EmergencyAccessType } from "app/static/types"
import { AppEventType, EventBus } from "app/utils/eventBus"

interface InviteProps {
  isShow: boolean
  onClose: () => void
  onAction: () => void
}
export const AddTrustedContactModal = observer(function AddTrustedContactModal(props: InviteProps) {
  const { isShow, onClose } = props
  const { colors } = useTheme()
  const { translate } = useHelper()
  const { inviteEA } = useCipherData()

  // ----------------------- PARAMS -----------------------
  const [email, setEmail] = useState<string>("")
  const [accessRight, setAccessRight] = useState(false) // false for view, true for takeover
  const [waitTime, setWaitTime] = useState(1)
  const [emailError, setEmailError] = useState("")
  const role = [
    {
      value: !accessRight,
      action: () => {
        setAccessRight(!accessRight)
      },
      text: translate("emergency_access.add.view"),
    },
    {
      value: accessRight,
      action: () => {
        setAccessRight(!accessRight)
      },
      text: translate("emergency_access.add.takeover"),
    },
  ]
  const time = [
    {
      value: 1,
      text: "1 " + translate("emergency_access.add.day"),
    },
    {
      value: 3,
      text: "3 " + translate("emergency_access.add.day"),
    },
    {
      value: 7,
      text: "7 " + translate("emergency_access.add.day"),
    },
    {
      value: 14,
      text: "14 " + translate("emergency_access.add.day"),
    },
    {
      value: 30,
      text: "30 " + translate("emergency_access.add.day"),
    },
  ]
  // ----------------------- METHODS -----------------------
  const onAdd = async () => {
    if (!email.includes("@")) return
    const res = await inviteEA(
      email.toLowerCase(),
      accessRight ? EmergencyAccessType.TAKEOVER : EmergencyAccessType.VIEW,
      waitTime,
    )
    if (res.kind === "ok") {
      onClose()
    }
    if (res.kind === "exist-data") {
      setEmailError(translate("emergency_access.add.exist_error"))
    }
    if (res.kind === "bad-data") {
      setEmailError(translate("error.invalid_data"))
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
      <Screen
        preset="scroll"
        safeAreaEdges={["bottom"]}
        padding
        header={
          <Header
            leftIcon="x"
            onLeftPress={onClose}
            title={translate("emergency_access.add_trust")}
            containerStyle={{ paddingTop: 0 }}
            RightActionComponent={
              <Button
                disabled={!email}
                text={translate("common.add")}
                preset="teriatary"
                onPress={onAdd}
              />
            }
          />
        }
        contentContainerStyle={{ flex: 1 }}
      >
        <Text preset="bold" text={translate("emergency_access.add.email")} />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderColor: emailError !== "" ? colors.error : colors.border,
            backgroundColor: colors.background,
            marginBottom: 10,
            marginTop: 12,
          }}
        >
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={"email@gmail.com"}
            selectionColor={colors.primary}
            style={{
              color: colors.title,
              fontSize: 16,
            }}
          />
        </View>
        {!!emailError && (
          <Text preset="label" text={emailError} style={{ color: colors.error, fontSize: 14 }} />
        )}

        {role.map((item, index) => (
          <View key={index}>
            <TouchableOpacity
              onPress={item.action}
              style={{ flexDirection: "row", marginVertical: 16 }}
            >
              <Toggle variant="checkbox" value={item.value} onValueChange={item.action} />
              <Text text={item.text} style={{ marginLeft: 12 }} />
            </TouchableOpacity>
          </View>
        ))}

        <Text
          preset="bold"
          text={translate("emergency_access.add.wait_time")}
          style={{ marginTop: 16 }}
        />
        <Text
          preset="label"
          text={translate("emergency_access.add.text")}
          style={{ marginTop: 8, fontSize: 14 }}
        />

        {time.map((item, index) => (
          <View key={index}>
            <TouchableOpacity
              onPress={() => {
                setWaitTime(item.value)
              }}
              style={{ flexDirection: "row", marginVertical: 16 }}
            >
              <Toggle
                variant="checkbox"
                value={item.value === waitTime}
                onValueChange={() => {
                  setWaitTime(item.value)
                }}
              />
              <Text text={item.text} style={{ marginLeft: 12 }} />
            </TouchableOpacity>
          </View>
        ))}
      </Screen>
    </Modal>
  )
})
