import React, { useState } from "react"
import { TouchableOpacity, View } from "react-native"
import { AutoImage as Image, Text } from "../../../../../components"
import { useMixins } from "../../../../../services/mixins"
import { TrustedContact } from "../../../../../services/api"
import { fontSize } from "../../../../../theme"
import { EmergencyAccessStatus } from "../../../../../config/types"
import { ContactAction } from "./contact-action"

interface Props {
  isYourTrusted: boolean
  trustedContact: TrustedContact
  setOnAction: () => void
}

export const Contact = (props: Props) => {
  const { trustedContact, setOnAction, isYourTrusted } = props
  const { translate, color } = useMixins()

  // ----------------------- PARAMS -----------------------

  const [showAction, setShowAcction] = useState(false)

  const isInvited = trustedContact.status === EmergencyAccessStatus.INVITED
  const isConfirm = trustedContact.status === EmergencyAccessStatus.CONFIRMED
  const isApproved = trustedContact.status === EmergencyAccessStatus.RECOVERY_APPROVED

  // ----------------------- METHODS -----------------------

  // ----------------------- RENDER -----------------------

  return (
    <TouchableOpacity
      onPress={() => setShowAcction(true)}
      style={{
        flexDirection: "row",
        marginVertical: 18,
        justifyContent: "space-between"
      }}
    >
      <ContactAction
        isYourTrusted={isYourTrusted}
        isShow={showAction}
        onClose={() => setShowAcction(false)}
        trustedContact={trustedContact}
        setOnAction={setOnAction}
      />

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={{ uri: trustedContact.avatar }}
          style={{ height: 40, width: 40, borderRadius: 20, marginRight: 12 }}
        />
        <View style={{ justifyContent: "space-between" }}>
          <Text
            preset="black"
            text={trustedContact.full_name}
          />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              text={trustedContact.email}
              style={{ fontSize: fontSize.small }}
            />

            {/** Status */}
            <View style={{
              alignSelf: "center",
              marginLeft: 10,
              paddingHorizontal: 10,
              paddingVertical: 2,
              backgroundColor: isInvited
                ? color.warning
                : isConfirm || isApproved
                  ? color.primary
                  : color.textBlack,
              borderRadius: 3,
            }}>
              <Text
                text={trustedContact.status.toUpperCase()}
                style={{
                  fontWeight: 'bold',
                  color: color.background,
                  fontSize: fontSize.mini
                }}
              />
            </View>
            {/** Status */}
          </View>
        </View>
      </View>
      <Text
        preset="black"
        text={trustedContact.type}
      />
    </TouchableOpacity >
  )
}