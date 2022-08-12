import React, { useState } from "react"
import { View } from "react-native"
import { ActionItem, ActionSheet, ActionSheetContent, AutoImage as Image, Button, Divider, Modal, Text } from "../../../../../components"
import { useMixins } from "../../../../../services/mixins"
import { TrustedContact } from "../../../../../services/api"
import { fontSize } from "../../../../../theme"
import { EmergencyAccessStatus, EmergencyAccessType } from "../../../../../config/types"
import { useStores } from "../../../../../models"
import { useNavigation } from "@react-navigation/native"

interface Props {
  isYourTrusted: boolean
  isShow: boolean
  onClose: () => void
  trustedContact: TrustedContact
  setOnAction: () => void
  showRequestModal: () => void
}

export const ContactAction = (props: Props) => {
  const { isShow, onClose, trustedContact, setOnAction, isYourTrusted, showRequestModal} = props
  const { translate, color } = useMixins()
  const { user } = useStores()
  const navigation = useNavigation()

  // ----------------------- PARAMS -----------------------

  const isViewType = trustedContact.type === EmergencyAccessType.VIEW
  const isInvited = trustedContact.status === EmergencyAccessStatus.INVITED
  const isConfirm = trustedContact.status === EmergencyAccessStatus.CONFIRMED
  const isApproved = trustedContact.status === EmergencyAccessStatus.RECOVERY_APPROVED
  const isInintiated = trustedContact.status === EmergencyAccessStatus.RECOVERY_INITIATED

  // ----------------------- METHODS -----------------------

  const handleYourTrustAction = async (action: "reject" | "approve") => {
    let res = await user.yourTrustedActionEA(trustedContact.id, action)
    res && setOnAction()
    onClose()
  }
  const handleTrustedYouAction = async (action: "accept" | "initiate") => {
    let res = await user.trustedYouActionEA(trustedContact.id, action)
    res && setOnAction()
    onClose()
  }

  const handleRemoveAction = async () => {
    let res = await user.removeEA(trustedContact.id)
    res && setOnAction()
    onClose()
  }

  // ----------------------- RENDER -----------------------

  const Avatar = () => (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      marginHorizontal: 20
    }}>
      <Image
        source={{ uri: trustedContact.avatar }}
        style={{ height: 40, width: 40, borderRadius: 20, marginRight: 12 }}
      />
      <View style={{ justifyContent: "space-between" }}>
        <Text
          preset="black"
          text={trustedContact.full_name}
        />
        <Text
          text={trustedContact.email}
          style={{ fontSize: fontSize.small }}
        />
      </View>
    </View>
  )
  const YourTrustedAction = () => (
    <ActionSheetContent >
      {isInintiated && <>
        <ActionItem
          name="Accept"
          action={() => {
            handleYourTrustAction('approve')
          }}
        />
        <Divider />
        <ActionItem
          name="Reject"
          action={() => {
            handleYourTrustAction('reject')
          }}
        />
        <Divider />
      </>}
      <ActionItem
        name="Remove"
        action={() => {
          handleRemoveAction()
        }}
        textColor={color.error}
      />
    </ActionSheetContent>
  )

  const TrustYouAction = () => (
    <ActionSheetContent >
      {
        isApproved && <>
          <ActionItem
            name={isViewType ? "View their vault" : "Take over their vault"}
            action={() => {
              onClose()
              navigation.navigate(isViewType ? "viewEA" : "takeoverEA", {
                trusted: trustedContact
              })
            }}
          />
          <Divider />
        </>
      }

      {
        isConfirm && <>
          <ActionItem
            name={isViewType ? "Request to view" : "Request to takeover"}
            action={() => {
              onClose()
              showRequestModal()
            }}
          />
          <Divider />
        </>
      }
      {
        isInvited && <>
          <ActionItem
            name="Accept"
            action={() => {
              handleTrustedYouAction('accept')
            }}
          />
          <Divider />
        </>
      }

      <ActionItem
        name="Remove"
        action={() => {
          handleRemoveAction()
        }}
        textColor={color.error}
      />
    </ActionSheetContent>
  )


  return (
    <ActionSheet
      isOpen={isShow}
      onClose={onClose}>
      <Avatar />
      <Divider />
      {
        isYourTrusted && <YourTrustedAction />
      }
      {
        !isYourTrusted && <TrustYouAction />
      }

    </ActionSheet>
  )
}