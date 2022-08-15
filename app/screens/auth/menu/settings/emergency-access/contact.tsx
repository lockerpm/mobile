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


  const status = (() => {
    switch (trustedContact.status) {
      case EmergencyAccessStatus.INVITED:
        return translate('emergency_access.invited')
      case EmergencyAccessStatus.CONFIRMED:
        return translate('emergency_access.confirm')
      case EmergencyAccessStatus.RECOVERY_APPROVED:
        return translate('emergency_access.recovery_approved')
      case EmergencyAccessStatus.RECOVERY_INITIATED:
        return translate('emergency_access.recovery_initiated')
    }
  })()
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
        text={translate('emergency_access.rq_noti', { waitTime: trustedContact.wait_time_days })}
        style={{ lineHeight: 20 }}
      />

      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
        <Button
          preset="outlinePlain"
          text={translate('common.cancel')}
          onPress={() => { setShowRequestModal(false) }}
          style={{ marginRight: 12 }}

        />
        <Button
          text={translate('common.yes')}
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
        onClose={(val?: string) => {
          setShowAcction(false)
          if (val === "rq_modal"){
            setShowRequestModal(true)
          }
        }}
        trustedContact={trustedContact}
        setOnAction={setOnAction}
        // showRequestModal={() => setShowRequestModal(true)}
      />

      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <Image
          source={{ uri: trustedContact.avatar }}
          style={{ height: 40, width: 40, borderRadius: 20, marginRight: 12 }}
        />
        <View style={{ justifyContent: "space-between", flex: 1}}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }} >
            <Text
              preset="black"
              text={trustedContact.full_name}
            />
            <Text
              preset="black"
              text={trustedContact.type === "view" ? translate('emergency_access.view') : translate('emergency_access.takeover')}
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
              position: "absolute",
              zIndex: 2,
              right: 0,
              paddingLeft: 10,
              alignSelf: "center",
              marginLeft: 10,
              paddingHorizontal: 5,
              backgroundColor: isInvited
                ? color.warning
                : isConfirm || isApproved
                  ? color.primary
                  : color.textBlack,
              borderRadius: 3,
            }}>
              <Text
                text={status}
                style={{
                  fontWeight: 'bold',
                  color: color.background,
                  fontSize: fontSize.small
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