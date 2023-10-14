import { useTheme } from 'app/services/context'
import React from 'react'
import { View } from 'react-native'
import { Text, BottomModal, ImageIcon } from 'app/components/cores'
import { useHelper } from 'app/services/hook'

export const DetailInstructionModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const { translate } = useHelper()
  const { colors } = useTheme()
  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title={translate('common.instruction')}>
      <View
        style={{
          width: '100%',
          padding: 20,
          backgroundColor: colors.block,
          borderRadius: 12,
          marginTop: 16,
        }}
      >
        {/* <Text preset="label" text={translate("onpremise_passwordless.instruction")} style={{ marginBottom: 16 }} /> */}
        <Instruction
          step="01."
          icon="app-logo"
          text={translate('onpremise_passwordless.instruction.1')}
        />
        <Instruction
          step="02."
          icon="avatar"
          text={translate('onpremise_passwordless.instruction.2')}
        />
        <Instruction
          step="03."
          icon="key-hole"
          text={translate('onpremise_passwordless.instruction.3')}
        />
        <Instruction
          step="04."
          icon="number-square-one"
          text={translate('onpremise_passwordless.instruction.4')}
        />
      </View>
    </BottomModal>
  )
}

const Instruction = ({
  step,
  icon,
  text,
}: {
  step: string
  icon: 'avatar' | 'app-logo' | 'key-hole' | 'number-square-one'
  text: string
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      <Text text={step} />
      <ImageIcon icon={icon} size={32} style={{ marginHorizontal: 12 }} />
      <Text
        text={text}
        style={{
          maxWidth: '75%',
        }}
      />
    </View>
  )
}
