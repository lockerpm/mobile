import React, { useEffect, useState } from "react"
import { View, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { EmergencyAccessStatus, EmergencyAccessType, TrustedContact } from "app/static/types"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { Text } from "app/components/cores"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils"

interface Props {
  isYourTrusted: boolean
  isShow: boolean
  onClose: (val?: string) => void
  trustedContact: TrustedContact
  setOnAction: () => void
  setShowRequestModal?: (val: boolean) => void
}

export const ContactAction = (props: Props) => {
  const { isShow, onClose, trustedContact, setOnAction, isYourTrusted, setShowRequestModal } = props
  const { colors } = useTheme()
  const { user } = useStores()
  const navigation = useNavigation() as any

  const [nextModal, setNextModal] = useState<"rq_modal" | null>(null)

  // ----------------------- PARAMS -----------------------

  const isViewType = trustedContact.type === EmergencyAccessType.VIEW
  const isInvited = trustedContact.status === EmergencyAccessStatus.INVITED
  const isConfirm = trustedContact.status === EmergencyAccessStatus.CONFIRMED
  const isApproved = trustedContact.status === EmergencyAccessStatus.RECOVERY_APPROVED
  const isInintiated = trustedContact.status === EmergencyAccessStatus.RECOVERY_INITIATED

  // ----------------------- METHODS -----------------------

  const handleYourTrustAction = async (action: "reject" | "approve" | "reinvite") => {
    const res = await user.yourTrustedActionEA(trustedContact.id, action)
    res && setOnAction()
    onClose()
  }
  const handleTrustedYouAction = async (action: "accept" | "initiate") => {
    const res = await user.trustedYouActionEA(trustedContact.id, action)
    res && setOnAction()
    onClose()
  }

  const handleRemoveAction = async () => {
    const res = await user.removeEA(trustedContact.id)
    res && setOnAction()
    onClose()
  }

  // ----------------------- RENDER -----------------------

  const Avatar = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        marginHorizontal: 20,
      }}
    >
      <Image
        resizeMode="contain"
        source={{ uri: trustedContact.avatar }}
        style={{ height: 40, width: 40, borderRadius: 20, marginRight: 12 }}
      />
      <View style={{ justifyContent: "space-between" }}>
        <Text text={trustedContact.full_name} />
        <Text preset="label" size="base" text={trustedContact.email} />
      </View>
    </View>
  )
  const YourTrustedAction = () => (
    <>
      {isInintiated && (
        <>
          <NewActionSheetItem
            tx="common.accept"
            onPress={() => {
              handleYourTrustAction("approve")
            }}
          />
          <NewActionSheetItem
            tx="common.reject"
            onPress={() => {
              handleYourTrustAction("reject")
            }}
          />
        </>
      )}
      {isInvited && (
        <>
          <NewActionSheetItem
            tx="emergency_access.resent"
            onPress={() => {
              handleYourTrustAction("reinvite")
            }}
          />
        </>
      )}
      <NewActionSheetItem
        tx="common.remove"
        onPress={() => {
          handleRemoveAction()
        }}
        color={colors.error}
      />
    </>
  )

  const TrustYouAction = () => (
    <>
      {isApproved && isViewType && (
        <>
          <NewActionSheetItem
            tx="emergency_access.view_vault"
            onPress={() => {
              onClose()
              navigation.navigate(isViewType ? "viewEA" : "takeoverEA", {
                trusted: trustedContact,
              })
            }}
          />
        </>
      )}
      {isApproved && !isViewType && (
        <>
          <NewActionSheetItem
            tx="emergency_access.reset_pw"
            onPress={() => {
              onClose()
              navigation.navigate("takeoverEA", {
                trusted: trustedContact,
                reset_pw: true,
              })
            }}
          />
          <NewActionSheetItem
            tx="emergency_access.reset_master_pw"
            onPress={() => {
              onClose()
              navigation.navigate("takeoverEA", {
                trusted: trustedContact,
                reset_pw: false,
              })
            }}
          />
        </>
      )}

      {isConfirm && (
        <>
          <NewActionSheetItem
            tx={isViewType ? "emergency_access.rq_view" : "emergency_access.rq_takeover"}
            onPress={() => {
              setNextModal("rq_modal")
              onClose()
              // handleTrustedYouAction('initiate')
            }}
          />
        </>
      )}
      {isInvited && (
        <>
          <NewActionSheetItem
            tx="common.accept"
            onPress={() => {
              handleTrustedYouAction("accept")
            }}
          />
        </>
      )}

      <NewActionSheetItem
        tx="common.remove"
        onPress={() => {
          handleRemoveAction()
        }}
        color={colors.error}
      />
    </>
  )

  useEffect(() => {
    if (!isShow) {
      if (nextModal === "rq_modal") {
        setShowRequestModal && setShowRequestModal(true)
        setNextModal(null)
      }
    }
  }, [isShow])

  return (
    <NewActionSheet
      isOpen={isShow}
      onClose={() => {
        setNextModal(null)
        onClose(nextModal)
      }}
      header={<Avatar />}
    >
      {isYourTrusted && <YourTrustedAction />}
      {!isYourTrusted && <TrustYouAction />}
    </NewActionSheet>
  )
}
