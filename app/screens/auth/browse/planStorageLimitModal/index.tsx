import { StackActions, useNavigation } from '@react-navigation/native'
import React from 'react'
import { Image } from 'react-native'
import { BottomModal, Button, Text } from 'app/components/cores'
import { useTheme } from 'app/services/context'
import { PREMIUM_FEATURES_IMG } from '../../menu/managePlan/PremiumFeature'
import { useHelper } from 'app/services/hook'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const PlanStorageLimitModal = ({ isOpen, onClose }: Props) => {
  const { colors } = useTheme()
  const navigation = useNavigation()
  const { translate } = useHelper()

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      style={{
        marginTop: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.block,
      }}
      title={translate('error.limit_storage')}
    >
      <Image
        source={PREMIUM_FEATURES_IMG.locker}
        style={{ height: '50%', width: '50%' }}
        resizeMode="contain"
      />

      <Text
        text={translate('payment.benefit.locker')}
        style={{ textAlign: 'center', lineHeight: 24, marginBottom: 12 }}
      />
      <Button
        text={translate('common.upgrade_now')}
        textStyle={{
          fontSize: 24,
          textDecorationLine: 'underline',
        }}
        onPress={() => {
          onClose()
          navigation.dispatch(StackActions.replace('payment'))
        }}
      />
    </BottomModal>
  )
}
