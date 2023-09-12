import React, { useEffect, useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { Text, Button, Modal } from "../../../components"
import Entypo from 'react-native-vector-icons/Entypo'
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"
import { EnterpriseInvitationStatus } from "../../../config/types"
import { EnterpriseInvitation } from "app/static/types"


type Props = {
  isOpen: boolean
  enterpeiseInvitations: EnterpriseInvitation[]
  onClose: () => void
}

// By domain only
export const EnterpriseInvitationModal = observer((props: Props) => {
  const { isOpen, onClose, enterpeiseInvitations } = props
  const { enterpriseStore } = useStores()
  const { translate, color } = useMixins()

  const [invitationByDomain, setInvitationByDomain] = useState(enterpeiseInvitations.find(e => !!e.domain))
  const [isLoading, setIsLoading] = useState(false)
  const [requested, setRequested] = useState(invitationByDomain?.status === EnterpriseInvitationStatus.REQUESTED)

  // ------------------ Params -----------------------

  const invitationByDomainAction = async () => {
    setIsLoading(true)
    const res = await enterpriseStore.invitationsActions(invitationByDomain?.id, "confirmed")
    if (res.kind === "ok") {
      setRequested(true)
    }
    setIsLoading(false)
  }

  // ------------------ Methods ----------------------
  useEffect(() => {
    const _invitation = enterpeiseInvitations.find(e => !!e.domain)
    setInvitationByDomain(_invitation)
    setRequested(_invitation?.status === EnterpriseInvitationStatus.REQUESTED)
  }, [enterpeiseInvitations])

  // ------------------------------ RENDER -------------------------------

  return (
    <Modal
      disableHeader
      isOpen={isOpen}
      onClose={onClose}
    >
      <View >
        <View style={{ alignItems: "center" }}>
          <Text
            preset="largeHeader"
            text={translate("enterprise_invitation.domain.join_org")}
            style={{ fontSize: 26 }}
          />
        </View>

        <View style={{ marginVertical: 12 }}>
          <Text
            preset="black"
            text={translate("enterprise_invitation.domain.managed_by")}
          />
          <Text
            preset="bold"
            text={`${invitationByDomain?.enterprise.name}`}
            style={{ fontSize: 18 }}
          />
        </View>

        <Text
          preset="black"
          text={translate("enterprise_invitation.enterprise_note.note", { name: invitationByDomain?.enterprise.name })}
        />

        <View style={{ marginVertical: 2, flexDirection: "row" }}>
          <Entypo name="dot-single" size={20} color={color.textBlack} />
          <Text
            preset="black"
            text={translate("enterprise_invitation.enterprise_note.note_1")}
          />
        </View>
        <View style={{ marginVertical: 2, flexDirection: "row" }}>
          <Entypo name="dot-single" size={20} color={color.textBlack} />
          <Text
            preset="black"
            text={translate("enterprise_invitation.enterprise_note.note_2")}
          />
        </View>
        <View style={{ marginVertical: 2, flexDirection: "row" }}>
          <Entypo name="dot-single" size={20} color={color.textBlack} />
          <Text
            preset="black"
            text={translate("enterprise_invitation.enterprise_note.note_3")}
          />
        </View>


        <Text
          preset="black"
          text={translate("enterprise_invitation.data", { name: invitationByDomain?.enterprise.name })}
          style={{ marginVertical: 8 }}
        />

        <Text
          preset="black"
          text={translate("enterprise_invitation.request_access", { name: invitationByDomain?.enterprise.name })}
          style={{ marginVertical: 8 }}
        />

        <Button
          isLoading={isLoading}
          isDisabled={requested || isLoading}
          text={requested ? translate("enterprise_invitation.btn_requested") : translate("enterprise_invitation.btn_request")}
          onPress={invitationByDomainAction}
        />
      </View>
    </Modal>
  )
})
