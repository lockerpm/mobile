import React from "react"
import { View } from "react-native"
import { ActionItem, ActionSheet, ActionSheetContent, AutoImage as Image, Divider, Text } from "../../../../../components"
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
}

export const ContactAction = (props: Props) => {
  const { isShow, onClose, trustedContact, setOnAction, isYourTrusted } = props
  const { translate, color } = useMixins()
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
          name="Cancel request"
          action={() => {
            // handleAction('accept')
          }}
        />
        <Divider />
        <ActionItem
          name="Request to view"
          action={() => {
            // handleAction('accept')
          }}
        />
        <Divider />
        <ActionItem
          name="Request to takeover"
          action={() => {
            // handleAction('accept')
          }}
        />
        <Divider />
        <ActionItem
          name="Accept"
          action={() => {
            // handleAction('accept')
          }}
        />
        <Divider />
        <ActionItem
          name="Decline"
          action={() => {
            // handleAction('remove')
          }}
          textColor={color.error}
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
    </ActionSheet>
  )
}