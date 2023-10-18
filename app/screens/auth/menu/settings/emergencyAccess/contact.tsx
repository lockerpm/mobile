import React, { useState } from 'react'
import { Dimensions, TouchableOpacity, View, Image } from 'react-native'
import { ContactAction } from './ContactAction'
import { EmergencyAccessStatus, TrustedContact } from 'app/static/types'
import { useTheme } from 'app/services/context'
import { useStores } from 'app/models'
import { BottomModal, Button, Text } from 'app/components/cores'
import { useHelper } from 'app/services/hook'

interface Props {
  isYourTrusted: boolean
  trustedContact: TrustedContact
  setOnAction: () => void
}

export const Contact = (props: Props) => {
  const { trustedContact, setOnAction, isYourTrusted } = props
  const { colors } = useTheme()
  const { user } = useStores()
  const { translate } = useHelper()

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
    const res = await user.trustedYouActionEA(trustedContact.id, 'initiate')
    if (res) {
      setOnAction()
      setShowRequestModal(false)
    }
  }
  // ----------------------- RENDER -----------------------

  const RequestAccessModal = () => (
    <BottomModal
      isOpen={isShowRequestModal}
      onClose={() => setShowRequestModal(false)}
      title={translate('common.confirmation')}
    >
      <Text
        text={translate('emergency_access.rq_noti', { waitTime: trustedContact.wait_time_days })}
        style={{ lineHeight: 20 }}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
        <Button
          preset="secondary"
          text={translate('common.cancel')}
          onPress={() => {
            setShowRequestModal(false)
          }}
          style={{ marginRight: 12, borderColor: colors.block }}
        />
        <Button text={translate('common.yes')} onPress={approveInitiateEA} />
      </View>
    </BottomModal>
  )

  return (
    <TouchableOpacity
      onPress={() => setShowAcction(true)}
      style={{
        flexDirection: 'row',
        marginVertical: 18,
        justifyContent: 'space-between',
      }}
    >
      <RequestAccessModal />
      <ContactAction
        isYourTrusted={isYourTrusted}
        isShow={showAction}
        onClose={(val?: string) => {
          setShowAcction(false)
          if (val === 'rq_modal') {
            setShowRequestModal(true)
          }
        }}
        trustedContact={trustedContact}
        setOnAction={setOnAction}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Image
          source={{ uri: trustedContact.avatar }}
          style={{ height: 40, width: 40, borderRadius: 20, marginRight: 12 }}
        />
        <View style={{ justifyContent: 'space-between', flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text
              style={{ maxWidth: Dimensions.get('screen').width - 200 }}
              text={trustedContact.full_name}
            />
            <Text
              text={
                trustedContact.type === 'view'
                  ? translate('emergency_access.view')
                  : translate('emergency_access.takeover')
              }
              style={{}}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text preset="label" size="base" text={trustedContact.email} />

            {/** Status */}
            <View
              style={{
                position: 'absolute',
                zIndex: 2,
                right: 0,
                backgroundColor: colors.background,
                paddingLeft: 5,
                borderRadius: 3,
              }}
            >
              <View
                style={{
                  backgroundColor: isInvited
                    ? colors.warning
                    : isConfirm || isApproved
                      ? colors.primary
                      : colors.title,
                  paddingHorizontal: 5,
                }}
              >
                <Text
                  preset="bold"
                  text={status}
                  size="base"
                  style={{
                    color: colors.background,
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}
