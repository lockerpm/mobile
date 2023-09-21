import React, { useState } from "react"
import { View } from "react-native"
import { Button, Text } from "app/components-v2/cores"
import { AccountRoleText, InvitationStatus } from "app/static/types"
import { useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { translate } from "app/i18n"

export type InvitationData = {
  access_time: number
  id: string
  role: AccountRoleText
  status: InvitationStatus
  team: {
    id: string
    name: string
    organization_id: string
  }
}

export const Invitation = (props: InvitationData) => {
  const { user } = useStores()
  const { colors, isDark } = useTheme()
  const { notify, notifyApiError } = useHelper()
  const [isLoading, setIsLoading] = useState('')

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
      backgroundColor: isDark ? colors.block : colors.background,
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
        preset="label"
        text={translate('menu.invitation_desc', { org: props.team.name })}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 20
        }}
      >
        <Button
          preset='secondary'
          text={translate('common.reject')}
          disabled={!!isLoading}
          loading={isLoading === 'reject'}
          onPress={() => handleInvitation('reject')}
          style={{
            marginRight: 10
          }}
        />
        <Button
          text={translate('common.accept')}
          disabled={!!isLoading}
          loading={isLoading === 'accept'}
          onPress={() => handleInvitation('accept')}
        />
      </View>
    </View>
  )
}
