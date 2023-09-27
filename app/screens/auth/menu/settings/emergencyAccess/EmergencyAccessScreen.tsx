/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useHelper } from 'app/services/hook'
import { useStores } from 'app/models'
import { EmergencyAccessStatus, TrustedContact } from 'app/static/types'
import { Screen, Header } from 'app/components-v2/cores'
import { useTheme } from 'app/services/context'
import { translate } from 'app/i18n'
import { MenuItemContainer, SettingsItem } from 'app/components-v2/utils'

export const EmergencyAccessScreen = () => {
  const navigation = useNavigation()
  const { notifyApiError } = useHelper()
  const { user } = useStores()
  const { colors } = useTheme()
  const isFree = user.isFreePlan

  // ----------------------- PARAMS -----------------------
  const [grant, setGrant] = useState<TrustedContact[]>([])
  const [trusted, setTrusted] = useState<TrustedContact[]>([])

  const pendingRequest = (() => {
    return trusted.filter((e) => e.status === EmergencyAccessStatus.RECOVERY_INITIATED).length
  })()

  const pendingInvite = (() => {
    return grant.filter((e) => e.status === EmergencyAccessStatus.INVITED).length
  })()
  // ----------------------- METHODS -----------------------

  const mount = async () => {
    const resTrusted = await user.trustedEA()
    if (resTrusted.kind === 'ok') {
      setTrusted(resTrusted.data)
    } else {
      notifyApiError(resTrusted)
    }
    const resGrant = await user.grantedEA()
    if (resGrant.kind === 'ok') {
      setGrant(resGrant.data)
    } else {
      notifyApiError(resGrant)
    }
  }
  // ----------------------- RENDER -----------------------
  useEffect(() => {
    mount()
  }, [])

  return (
    <Screen
      padding
      safeAreaEdges={['bottom']}
      header={
        <Header
          leftIcon='arrow-left'
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={translate('emergency_access.title')}
        />
      }
      backgroundColor={colors.block}
    >
      <MenuItemContainer>
        <SettingsItem
          name={translate('emergency_access.your_trust')}
          onPress={() => {
            isFree ? navigation.navigate('payment', { premium: true }) : navigation.navigate('yourTrustedContact')
          }}
        // status={
        //   pendingRequest > 0
        //     ? translate('emergency_access.pending_trusted', {
        //       count: pendingRequest,
        //       s: pendingRequest > 1 ? 's' : '',
        //     })
        //     : ''
        // }
        />

        <SettingsItem
          name={translate('emergency_access.trust_you')}
          onPress={() => navigation.navigate('contactsTrustedYou')}
        // status={
        //   pendingInvite > 0
        //     ? translate('emergency_access.pending_grant', {
        //       count: pendingInvite,
        //       s: pendingInvite > 1 ? 's' : '',
        //     })
        //     : ''
        // }
        />
      </MenuItemContainer>
    </Screen>
  )
}
