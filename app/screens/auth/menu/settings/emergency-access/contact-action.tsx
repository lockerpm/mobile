import React, { useState } from "react"
import { View } from "react-native"
import { ActionItem, ActionSheet, ActionSheetContent, AutoImage as Image, Button, Divider, Modal, Text } from "../../../../../components"
import { useMixins } from "../../../../../services/mixins"
import { TrustedContact } from "../../../../../services/api"
import { fontSize } from "../../../../../theme"
import { EmergencyAccessStatus } from "../../../../../config/types"
import { useStores } from "../../../../../models"

interface Props {
  isYourTrusted: boolean
  isShow: boolean
  onClose: () => void
  trustedContact: TrustedContact
  setOnAction: () => void
  showRequestModal: () => void
}

export const ContactAction = (props: Props) => {
  const { isShow, onClose, trustedContact, setOnAction, isYourTrusted, showRequestModal } = props
  const actionProps = { trustedContact, setOnAction, onClose }
  // const { translate, color } = useMixins()
  const { user } = useStores()

  // ----------------------- PARAMS -----------------------

  // ----------------------- METHODS -----------------------

  const handleAction = async (action: "accept" | "initiate" | "comfirm" | "reject" | "remove") => {
    let res = false
    if (action === "remove") {
      res = await user.removeEA(trustedContact.id)
    } else {
      res = await user.actionEA(trustedContact.id, action)
    }

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


  return (
    <ActionSheet
      isOpen={isShow}
      onClose={onClose}>
      <Avatar />
      <Divider />
      {
        isYourTrusted && <YourTrustActionContent {...actionProps} />
      }
      {
        !isYourTrusted && <GrantedActionContent {...actionProps} showRequestModal={showRequestModal} />
      }
    </ActionSheet>
  )
}

interface ActionProps {
  onClose: () => void
  trustedContact: TrustedContact
  setOnAction: () => void
  showRequestModal?: () => void
}
const GrantedActionContent = (props: ActionProps) => {
  const { onClose, trustedContact, setOnAction, showRequestModal } = props
  const { user } = useStores()
  const { translate, color } = useMixins()


  const handleAction = async (action: "accept" | "initiate" | "comfirm" | "reject" | "remove") => {
    let res = false
    if (action === "remove") {
      res = await user.removeEA(trustedContact.id)
    } else {
      res = await user.actionEA(trustedContact.id, action)
    }

    res && setOnAction()
    onClose()
  }


  return (
    <ActionSheetContent >
      <ActionItem
        name="Take over their vault"
        action={() => {
          // handleAction('accept')
        }}
      />
      <Divider />
      <ActionItem
        name="View their vault"
        action={() => {
          // handleAction('accept')
        }}
      />
      <Divider />
      <ActionItem
        name="Request to view"
        action={() => {
          onClose()
          showRequestModal()
        }}
      />
      <Divider />
      <ActionItem
        name="Request to takeover"
        action={() => {
          onClose()
          showRequestModal()
        }}
      />
      <Divider />
      <ActionItem
        name="Accept"
        action={() => {
          handleAction('accept')
        }}
      />
      <Divider />
      <ActionItem
        name="Decline request"
        action={() => {
          handleAction('reject')
        }}
      />
      <Divider />
      <ActionItem
        name="Remove"
        action={() => {
          handleAction('remove')
        }}
        textColor={color.error}
      />
      <Divider />
    </ActionSheetContent>
  )
}

const YourTrustActionContent = (props: ActionProps) => {
  const { onClose, trustedContact, setOnAction } = props
  const { user } = useStores()
  const { translate, color } = useMixins()


  const handleAction = async (action: "accept" | "initiate" | "comfirm" | "reject" | "remove") => {
    let res = false
    if (action === "remove") {
      res = await user.removeEA(trustedContact.id)
    } else {
      res = await user.actionEA(trustedContact.id, action)
    }

    res && setOnAction()
    onClose()
  }

  return (
    <ActionSheetContent >
      <ActionItem
        name="Accept request"
        action={() => {
          handleAction('accept')
        }}
      />
      <Divider />
      <ActionItem
        name="Decline request"
        action={() => {
          handleAction('reject')
        }}
      />
      <Divider />
      <ActionItem
        name="Remove contact"
        action={() => {
          handleAction('remove')
        }}
        textColor={color.error}
      />
    </ActionSheetContent>
  )
}