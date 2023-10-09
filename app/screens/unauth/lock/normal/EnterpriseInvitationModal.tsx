import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Text, Button, Icon, BottomModal } from 'app/components/cores'
import { useStores } from 'app/models'
import { EnterpriseInvitation, EnterpriseInvitationStatus } from 'app/static/types'
import { translate } from 'app/i18n'

type Props = {
  isOpen: boolean
  enterpeiseInvitations: EnterpriseInvitation[]
  onClose: () => void
}

// By domain only
export const EnterpriseInvitationModal = (props: Props) => {
  const { isOpen, onClose, enterpeiseInvitations } = props
  const { enterpriseStore } = useStores()

  const [invitationByDomain, setInvitationByDomain] = useState(
    enterpeiseInvitations.find((e) => !!e.domain)
  )
  const [isLoading, setIsLoading] = useState(false)
  const [requested, setRequested] = useState(
    invitationByDomain?.status === EnterpriseInvitationStatus.REQUESTED
  )

  // ------------------ Params -----------------------

  const invitationByDomainAction = async () => {
    setIsLoading(true)
    const res = await enterpriseStore.invitationsActions(invitationByDomain?.id, 'confirmed')
    if (res.kind === 'ok') {
      setRequested(true)
    }
    setIsLoading(false)
  }

  // ------------------ Methods ----------------------
  useEffect(() => {
    const _invitation = enterpeiseInvitations.find((e) => !!e.domain)
    setInvitationByDomain(_invitation)
    setRequested(_invitation?.status === EnterpriseInvitationStatus.REQUESTED)
  }, [enterpeiseInvitations])

  // ------------------------------ RENDER -------------------------------

  return (
    <BottomModal title={translate('enterprise_invitation.domain.join_org')} isOpen={isOpen} onClose={onClose}>
      <View>
        <View style={{ marginVertical: 12 }}>
          <Text text={translate('enterprise_invitation.domain.managed_by')} />
          <Text
            preset="bold"
            text={`${invitationByDomain?.enterprise.name}`}
            style={{ fontSize: 18 }}
          />
        </View>

        <Text
          text={translate('enterprise_invitation.enterprise_note.note', {
            name: invitationByDomain?.enterprise.name,
          })}
        />
        <Desription text={translate('enterprise_invitation.enterprise_note.note_1')} />
        <Desription text={translate('enterprise_invitation.enterprise_note.note_2')} />
        <Desription text={translate('enterprise_invitation.enterprise_note.note_3')} />

        <Text
          text={translate('enterprise_invitation.data', {
            name: invitationByDomain?.enterprise.name,
          })}
          style={{ marginVertical: 8 }}
        />

        <Text
          text={translate('enterprise_invitation.request_access', {
            name: invitationByDomain?.enterprise.name,
          })}
          style={{ marginVertical: 12, marginBottom: 20, }}
        />

        <Button
          loading={isLoading}
          disabled={requested || isLoading}
          text={
            requested
              ? translate('enterprise_invitation.btn_requested')
              : translate('enterprise_invitation.btn_request')
          }
          onPress={invitationByDomainAction}
        />
      </View>
    </BottomModal>
  )
}
const Desription = ({ text }: { text: string }) => (
  <View style={{ marginVertical: 2, flexDirection: 'row', alignItems: 'center' }}>
    <Icon icon="dot" size={20} />
    <Text text={text} />
  </View>
)
