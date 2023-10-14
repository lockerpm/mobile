import React, { useState } from 'react'
import { View, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { EmergencyAccessStatus, EmergencyAccessType, TrustedContact } from 'app/static/types'
import { useTheme } from 'app/services/context'
import { useStores } from 'app/models'
import { Text } from 'app/components/cores'
import { ActionItem, ActionSheet } from 'app/components/ciphers'
import { useHelper } from 'app/services/hook'

interface Props {
  isYourTrusted: boolean
  isShow: boolean
  onClose: (val?: string) => void
  trustedContact: TrustedContact
  setOnAction: () => void
}

export const ContactAction = (props: Props) => {
  const { isShow, onClose, trustedContact, setOnAction, isYourTrusted } = props
  const { colors } = useTheme()
  const { user } = useStores()
  const { translate } = useHelper()
  const navigation = useNavigation() as any

  const [nextModal, setNextModal] = useState<'rq_modal' | null>(null)

  // ----------------------- PARAMS -----------------------

  const isViewType = trustedContact.type === EmergencyAccessType.VIEW
  const isInvited = trustedContact.status === EmergencyAccessStatus.INVITED
  const isConfirm = trustedContact.status === EmergencyAccessStatus.CONFIRMED
  const isApproved = trustedContact.status === EmergencyAccessStatus.RECOVERY_APPROVED
  const isInintiated = trustedContact.status === EmergencyAccessStatus.RECOVERY_INITIATED

  // ----------------------- METHODS -----------------------

  const handleYourTrustAction = async (action: 'reject' | 'approve' | 'reinvite') => {
    const res = await user.yourTrustedActionEA(trustedContact.id, action)
    res && setOnAction()
    onClose()
  }
  const handleTrustedYouAction = async (action: 'accept' | 'initiate') => {
    const res = await user.trustedYouActionEA(trustedContact.id, action)
    res && setOnAction()
    onClose()
  }

  const handleRemoveAction = async () => {
    const res = await user.removeEA(trustedContact.id)
    res && setOnAction()
    onClose()
  }

  // ----------------------- RENDER -----------------------

  const Avatar = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginHorizontal: 20,
      }}
    >
      <Image
        source={{ uri: trustedContact.avatar }}
        style={{ height: 40, width: 40, borderRadius: 20, marginRight: 12 }}
      />
      <View style={{ justifyContent: 'space-between' }}>
        <Text text={trustedContact.full_name} />
        <Text preset="label" size="base" text={trustedContact.email} />
      </View>
    </View>
  )
  const YourTrustedAction = () => (
    <>
      {isInintiated && (
        <>
          <ActionItem
            name={translate('common.accept')}
            action={() => {
              handleYourTrustAction('approve')
            }}
          />
          <ActionItem
            name={translate('common.reject')}
            action={() => {
              handleYourTrustAction('reject')
            }}
          />
        </>
      )}
      {isInvited && (
        <>
          <ActionItem
            name={translate('emergency_access.resent')}
            action={() => {
              handleYourTrustAction('reinvite')
            }}
          />
        </>
      )}
      <ActionItem
        name={translate('common.remove')}
        action={() => {
          handleRemoveAction()
        }}
        color={colors.error}
      />
    </>
  )

  const TrustYouAction = () => (
    <>
      {isApproved && isViewType && (
        <>
          <ActionItem
            name={translate('emergency_access.view_vault')}
            action={() => {
              onClose()
              navigation.navigate(isViewType ? 'viewEA' : 'takeoverEA', {
                trusted: trustedContact,
              })
            }}
          />
        </>
      )}
      {isApproved && !isViewType && (
        <>
          <ActionItem
            name={translate('emergency_access.reset_pw')}
            action={() => {
              onClose()
              navigation.navigate('takeoverEA', {
                trusted: trustedContact,
                reset_pw: true,
              })
            }}
          />
          <ActionItem
            name={translate('emergency_access.reset_master_pw')}
            action={() => {
              onClose()
              navigation.navigate('takeoverEA', {
                trusted: trustedContact,
                reset_pw: false,
              })
            }}
          />
        </>
      )}

      {isConfirm && (
        <>
          <ActionItem
            name={
              isViewType
                ? translate('emergency_access.rq_view')
                : translate('emergency_access.rq_takeover')
            }
            action={() => {
              setNextModal('rq_modal')
              onClose()
              // handleTrustedYouAction('initiate')
            }}
          />
        </>
      )}
      {isInvited && (
        <>
          <ActionItem
            name={translate('common.accept')}
            action={() => {
              handleTrustedYouAction('accept')
            }}
          />
        </>
      )}

      <ActionItem
        name={translate('common.remove')}
        action={() => {
          handleRemoveAction()
        }}
        color={colors.error}
      />
    </>
  )

  return (
    <ActionSheet
      isOpen={isShow}
      onClose={() => {
        setNextModal(null)
        onClose(nextModal)
      }}
      header={<Avatar />}
    >
      {isYourTrusted && <YourTrustedAction />}
      {!isYourTrusted && <TrustYouAction />}
    </ActionSheet>
  )
}
