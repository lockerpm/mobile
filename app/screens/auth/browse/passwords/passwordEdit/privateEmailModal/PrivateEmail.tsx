import React, { useEffect, useState } from "react"
import { Text, Icon } from "app/components/cores"
import { View } from "react-native"
import { useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import { ActionItem } from "app/components/ciphers"
import { PrivateEmailList } from "./PrivateEmailList"
import Modal from "react-native-modal"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useStores } from "app/models"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import { useNavigation } from "@react-navigation/native"
import { GeneralApiProblem } from "app/services/api/apiProblem"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelectEmail: (email: string) => void
}

export const PrivateEmailModal = ({ isOpen, onClose, onSelectEmail }: Props) => {
  const navigation = useNavigation() as any
  const { translate, notifyApiError } = useHelper()
  const { colors } = useTheme()
  const { toolStore, user } = useStores()
  const insets = useSafeAreaInsets()

  const [isSelectFronExisting, setIsSelectFromExisting] = useState(false)

  const generateFailed = (res: GeneralApiProblem) => {
    notifyApiError(res)
    // @ts-ignore
    if (user.isFreePlan && res.data?.code === "8000") {
      onClose()
      navigation.navigate("payment")
    }
  }

  const generateRelayNewAddress = async () => {
    const res = await toolStore.generateRelayNewAddress()
    if (res.kind === "ok") {
      logFirebaseEvent(AnalyticEvents.CREATE_PRIVATE_EMAIL, user.email)
      onSelectEmail(res.data.full_address)
    } else {
      generateFailed(res)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setIsSelectFromExisting(false)
    }
  }, [isOpen])

  return (
    <Modal
      avoidKeyboard
      isVisible={isOpen}
      animationIn={"slideInUp"}
      animationOut={"slideOutDown"}
      onBackdropPress={onClose}
      style={{
        margin: 0,
        paddingTop: insets.top,
        justifyContent: "flex-end",
      }}
    >
      <View
        style={{
          borderTopLeftRadius: 12,
          borderTopEndRadius: 12,
          backgroundColor: colors.background,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <View
          style={{
            height: 56,
            padding: 6,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
          }}
        >
          {isSelectFronExisting && (
            <Icon icon="arrow-left" onPress={() => setIsSelectFromExisting(false)} />
          )}
          <Text
            preset="bold"
            text={
              isSelectFronExisting
                ? translate("password.hide_email.existing_email")
                : translate("password.hide_email.title")
            }
            numberOfLines={1}
            style={{ textAlign: isSelectFronExisting ? "center" : "left" }}
          />
          <Icon icon="x" onPress={onClose} containerStyle={{}} />
        </View>

        {!isSelectFronExisting && (
          <>
            <ActionItem
              name={translate("password.hide_email.generate_new")}
              icon="zap-fast"
              action={generateRelayNewAddress}
            />
            <ActionItem
              name={translate("password.hide_email.existing_email")}
              icon="mail-03"
              action={() => {
                setIsSelectFromExisting(true)
              }}
            />
          </>
        )}
        {isSelectFronExisting && <PrivateEmailList onSelect={onSelectEmail} />}
      </View>
    </Modal>
  )
}
