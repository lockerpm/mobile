import React from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import { Text, Button } from 'app/components/cores'
import { Modal } from 'app/components/utils'
import { translate } from 'app/i18n'

type Props = {
  isCreating: boolean
  isOpen: boolean
  onClose: () => void
  onNext: () => void
}

const WARNING = require('assets/images/master-pw-important.png')

export const ConfirmCreateMPModal = (props: Props) => {
  const { isOpen, onClose, onNext, isCreating } = props

  return (
    <Modal disableHeader isOpen={isOpen} onClose={onClose} ignoreBackgroundPress={true}>
      <View style={{ alignItems: 'center' }}>
        <Text preset="bold" size="xl" text={translate('confirm_create_master_pass.title')} />
        <Image source={WARNING} style={{ width: 120, height: 120 }} />
        <Text
          text={translate('confirm_create_master_pass.desc')}
          style={{ textAlign: 'center', fontSize: 14 }}
        />
      </View>

      <Button
        disabled={isCreating}
        loading={isCreating}
        textStyle={{ textAlign: 'center' }}
        text={translate('confirm_create_master_pass.next_btn')}
        onPress={onNext}
        style={{ marginVertical: 16 }}
      />
      <TouchableOpacity disabled={isCreating} onPress={onClose}>
        <Text
          size="base"
          text={translate('confirm_create_master_pass.back_btn')}
          style={{ textAlign: 'center' }}
        />
      </TouchableOpacity>
    </Modal>
  )
}
