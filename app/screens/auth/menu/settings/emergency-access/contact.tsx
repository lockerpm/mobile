import React, { useState } from "react"
import { TouchableOpacity, View } from "react-native"
import { AutoImage as Image, Button, Modal, Text } from "../../../../../components"
import { useMixins } from "../../../../../services/mixins"
import { TrustedContact } from "../../../../../services/api"
import { fontSize } from "../../../../../theme"
import { EmergencyAccessStatus } from "../../../../../config/types"
import { ContactAction } from "./contact-action"
import { useStores } from "../../../../../models"

interface Props {
  isYourTrusted: boolean
  trustedContact: TrustedContact
  setOnAction: () => void
}

export const Contact = (props: Props) => {
  const { trustedContact, setOnAction, isYourTrusted } = props
  const { translate, color } = useMixins()
  const { user } = useStores()

  // ----------------------- PARAMS -----------------------

  const [showAction, setShowAcction] = useState(false)
  const [isShowRequestModal, setShowRequestModal] = useState(false)

  const isInvited = trustedContact.status === EmergencyAccessStatus.INVITED
  const isConfirm = trustedContact.status === EmergencyAccessStatus.CONFIRMED
  const isApproved = trustedContact.status === EmergencyAccessStatus.RECOVERY_APPROVED

  // ----------------------- METHODS -----------------------

  const approveInitiateEA = async () => {
    const res = await user.trustedYouActionEA(trustedContact.id, "initiate")
    if (res) {
      setOnAction()
      setShowRequestModal(false)
    }
  }
  // ----------------------- RENDER -----------------------

  const RequestAccessModal = () => (
    <Modal
      isOpen={isShowRequestModal}
      onClose={() => setShowRequestModal(false)}
      title={trustedContact.full_name}
    >
      <Text preset="black"
        text={`Are you sure you want to request emergency access? You will be provided access after 1 day(s) or whenever the user manually approves the request`}
        style={{ lineHeight: 20 }}
      />

      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
        <Button
          preset="outlinePlain"
          text={"No"}
          onPress={() => { setShowRequestModal(false) }}
          style={{ marginRight: 12 }}

        />
        <Button
          text={"Approve"}
          onPress={approveInitiateEA}
        />
      </View>
    </Modal>
  )
  return (
    <TouchableOpacity
      onPress={() => setShowAcction(true)}
      style={{
        flexDirection: "row",
        marginVertical: 18,
        justifyContent: "space-between"
      }}
    >
      <RequestAccessModal />
      <ContactAction
        isYourTrusted={isYourTrusted}
        isShow={showAction}
        onClose={() => setShowAcction(false)}
        trustedContact={trustedContact}
        setOnAction={setOnAction}
        showRequestModal={() => setShowRequestModal(true)}
      />

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={{ uri: trustedContact.avatar }}
          style={{ height: 40, width: 40, borderRadius: 20, marginRight: 12 }}
        />
        <View style={{ justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }} >
            <Text
              preset="black"
              text={trustedContact.full_name}
            />
            <Text
              preset="black"
              text={trustedContact.type}
              style={{}}
            />
          </View>

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

    </TouchableOpacity >
  )
}