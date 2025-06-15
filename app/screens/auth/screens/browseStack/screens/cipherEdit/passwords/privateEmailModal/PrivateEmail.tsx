import React, { useEffect, useState } from "react"
import { Text, Icon } from "app/components/cores"
import { View, Modal } from "react-native"
import { useAppLocale, useTheme } from "app/services/context"
import { PrivateEmailList } from "./PrivateEmailList"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useStores } from "app/models"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import { useNavigation } from "@react-navigation/native"
import { GeneralApiProblem } from "app/services/api/apiProblem"
import { useToast } from "app/services/utils"
import { NewActionSheetItem } from "app/components/utils"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelectEmail: (email: string) => void
}

export const PrivateEmailModal = ({ isOpen, onClose, onSelectEmail }: Props) => {
  const navigation = useNavigation() as any
  const { notifyApiError } = useToast()
  const { translate } = useAppLocale()
  const { colors } = useTheme()
  const { toolStore, user } = useStores()
  const insets = useSafeAreaInsets()

  const [isSelectFronExisting, setIsSelectFromExisting] = useState(false)

  const generateFailed = (res: GeneralApiProblem) => {
    notifyApiError(res)
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
      visible={isOpen}
      onDismiss={onClose}
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
            <NewActionSheetItem
              tx="password.hide_email.generate_new"
              icon="zap-fast"
              onPress={generateRelayNewAddress}
            />
            <View style={{ height: 1.3, backgroundColor: colors.border }}></View>
            <NewActionSheetItem
              tx="password.hide_email.existing_email"
              icon="mail-03"
              onPress={() => {
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
