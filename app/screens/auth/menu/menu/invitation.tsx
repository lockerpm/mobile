import React, { useState } from "react"
import { View } from "react-native"
import { Button, Text } from "../../../../components"
import { commonStyles, color as colorLight, colorDark } from "../../../../theme"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"

export type InvitationData = {
  access_time: number
  id: string
  role: 'admin' | 'manager' | 'member'
  status: 'confirmed' | 'invited' | 'rejected'
  team: {
      id: string
      name: string
      organization_id: string
  }
}

export const Invitation = observer((props: InvitationData) => {
  const { user, uiStore } = useStores()
  const { notify, translate, notifyApiError } = useMixins()
  const [isLoading, setIsLoading] = useState('')
  const color = uiStore.isDark ? colorDark : colorLight

  const handleInvitation = async (status: 'accept' | 'reject') => {
    setIsLoading(status)
    const res = await user.invitationRespond(props.id, status)
    setIsLoading('')
    if (res.kind === 'ok') {
      notify('success', status === 'accept' 
        ? translate('success.invitation_accepted') 
        : translate('success.invitation_rejected')
      )
      user.setInvitations(user.invitations.filter(item => item.id !== props.id))
    } else {
      notifyApiError(res)
    }
  }

  return (
    <View style={{
      backgroundColor: uiStore.isDark ? color.block : color.background,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 20,
      marginBottom: 15
    }}>
      <Text
        preset="bold"
        text={translate('menu.invitation_to_join') + props.team.name}
        style={{
          marginBottom: 10
        }}
      />
      <Text
        text={translate('menu.invitation_desc', { org: props.team.name })}
      />
      <View
        style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
          marginTop: 20
        }]}
      >
        <Button
          preset="outline"
          text={translate('common.reject')}
          isDisabled={!!isLoading}
          isLoading={isLoading === 'reject'}
          onPress={() => handleInvitation('reject')}
          style={{
            marginRight: 10
          }}
        />
        <Button
          text={translate('common.accept')}
          isDisabled={!!isLoading}
          isLoading={isLoading === 'accept'}
          onPress={() => handleInvitation('accept')}
        />
      </View>
    </View>
  )
})
