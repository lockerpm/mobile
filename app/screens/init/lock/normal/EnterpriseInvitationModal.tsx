import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import { Text, Button, Icon, BottomModal, TextProps } from "app/components/cores"
import { useStores } from "app/models"
import { EnterpriseInvitation, EnterpriseInvitationStatus } from "app/static/types"

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
    if (invitationByDomain?.id !== undefined) {
      setIsLoading(true)

      const res = await enterpriseStore.invitationsActions(invitationByDomain?.id, "confirmed")
      if (res.kind === "ok") {
        setRequested(true)
      }
      setIsLoading(false)
    }
  }

  // ------------------ Methods ----------------------
  useEffect(() => {
    const _invitation = enterpeiseInvitations.find((e) => !!e.domain)
    setInvitationByDomain(_invitation)
    setRequested(_invitation?.status === EnterpriseInvitationStatus.REQUESTED)
  }, [enterpeiseInvitations])

  // ------------------------------ RENDER -------------------------------

  return (
    <BottomModal tx={"enterprise_invitation:domain.join_org"} isOpen={isOpen} onClose={onClose}>
      <View>
        <View style={styles.title}>
          <Text tx={"enterprise_invitation:domain.managed_by"} />
          <Text preset="bold" text={`${invitationByDomain?.enterprise.name}`} size="md" />
        </View>

        <Text
          tx={"enterprise_invitation:enterprise_note.note"}
          txOptions={{
            name: invitationByDomain?.enterprise.name,
          }}
        />
        <Desription tx={"enterprise_invitation:enterprise_note.note_1"} />
        <Desription tx={"enterprise_invitation:enterprise_note.note_2"} />
        <Desription tx={"enterprise_invitation:enterprise_note.note_3"} />

        <Text
          tx={"enterprise_invitation:data"}
          txOptions={{
            name: invitationByDomain?.enterprise.name,
          }}
          style={styles.data}
        />

        <Text
          tx={"enterprise_invitation:request_access"}
          txOptions={{
            name: invitationByDomain?.enterprise.name,
          }}
          style={styles.requestAccess}
        />

        <Button
          loading={isLoading}
          disabled={requested || isLoading}
          tx={
            requested ? "enterprise_invitation:btn_requested" : "enterprise_invitation:btn_request"
          }
          onPress={invitationByDomainAction}
        />
      </View>
    </BottomModal>
  )
}
const Desription = ({ tx }: { tx: TextProps["tx"] }) => (
  <View style={styles.desContainer}>
    <Icon icon="dot" size={20} />
    <Text tx={tx} />
  </View>
)

const styles = StyleSheet.create({
  data: {
    marginVertical: 8,
  },
  desContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 2,
  },
  requestAccess: {
    marginBottom: 20,
    marginVertical: 12,
  },
  title: {
    marginVertical: 12,
  },
})
