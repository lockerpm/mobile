import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import {
  ActionItem,
  ActionSheet,
  ActionSheetContent,
  AutoImage as Image,
  Divider,
  Text,
} from '../../../../../components'
import { useMixins } from '../../../../../services/mixins'
import { fontSize } from '../../../../../theme'
import { EmergencyAccessStatus, EmergencyAccessType } from '../../../../../config/types'
import { useStores } from '../../../../../models'
import { useNavigation } from '@react-navigation/native'
import { TrustedContact } from '../../../../../config/types/api'

interface Props {
  isYourTrusted: boolean
  isShow: boolean
  onClose: (val?: string) => void
  trustedContact: TrustedContact
  setOnAction: () => void
}

export const ContactAction = (props: Props) => {
  const { isShow, onClose, trustedContact, setOnAction, isYourTrusted } = props
  const { translate, color } = useMixins()
  const { user } = useStores()
  const navigation = useNavigation()

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
        <Text preset="black" text={trustedContact.full_name} />
        <Text text={trustedContact.email} style={{ fontSize: fontSize.small }} />
      </View>
    </View>
  )
  const YourTrustedAction = () => (
    <ActionSheetContent>
      {isInintiated && (
        <>
          <ActionItem
            name={translate('common.accept')}
            action={() => {
              handleYourTrustAction('approve')
            }}
          />
          <Divider />
          <ActionItem
            name={translate('common.reject')}
            action={() => {
              handleYourTrustAction('reject')
            }}
          />
          <Divider />
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
          <Divider />
        </>
      )}
      <ActionItem
        name={translate('common.remove')}
        action={() => {
          handleRemoveAction()
        }}
        textColor={color.error}
      />
    </ActionSheetContent>
  )

  const TrustYouAction = () => (
    <ActionSheetContent>
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
          <Divider />
        </>
      )}
      {isApproved && !isViewType && (
        <>
          <ActionItem
            name={translate('emergency_access.reset_pw')}
            action={() => {
              onClose()
              navigation.navigate("takeoverEA", {
                trusted: trustedContact,
                reset_pw: true
              })
            }}
          />
          <Divider />
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
          <Divider />
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
              setNextModal("rq_modal")
              onClose()
              // handleTrustedYouAction('initiate')
            }}
          />
          <Divider />
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
          <Divider />
        </>
      )}

      <ActionItem
        name={translate('common.remove')}
        action={() => {
          handleRemoveAction()
        }}
        textColor={color.error}
      />
    </ActionSheetContent>
  )

  return (
    <ActionSheet isOpen={isShow} onClose={() => {
      setNextModal(null)
      onClose(nextModal)
    }}>
      <Avatar />
      <Divider />
      {isYourTrusted && <YourTrustedAction />}
      {!isYourTrusted && <TrustYouAction />}
    </ActionSheet>
  )
}