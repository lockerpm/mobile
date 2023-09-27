import React, { useState } from 'react'
import { BottomModal, Button, TextInput } from 'app/components/cores'
import { useAuthentication, useHelper } from 'app/services/hook'
import { translate } from 'app/i18n'
import { useCoreService } from 'app/services/coreService'

interface Props {
  isOpen?: boolean
  onClose?: () => void
  onConfirm?: () => void
  navigation: any
}

export const ConfirmPassModal = (props: Props) => {
  const { isOpen, onClose, onConfirm, navigation } = props
  const { notify } = useHelper()
  const { lock } = useAuthentication()
  const { cryptoService } = useCoreService()

  const [masterPass, setMasterPass] = useState('')
  const [count, setCount] = useState(0)
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    if (!masterPass.trim()) {
      return
    }

    setIsLoading(true)

    // Check master pass
    const storedKeyHash = await cryptoService.getKeyHash()
    const keyHash = await cryptoService.hashPassword(masterPass, null)
    setIsLoading(false)
    if (storedKeyHash != null && keyHash != null && storedKeyHash === keyHash) {
      setMasterPass('')
      onClose && onClose()
      onConfirm && onConfirm()
    } else {
      setIsError(true)
      setCount(count + 1)
      if (count > 5) {
        notify('error', translate('error.too_many_failed_attempts'))
        await lock()
        navigation.navigate('lock')
      }
    }
  }

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title={translate('common.enter_master_pass')}>
      <TextInput
        isPassword
        isError={isError}
        helper={translate('error.invalid_password')}
        placeholder={translate('common.master_pass')}
        value={masterPass}
        onChangeText={(txt) => {
          setIsError(false)
          setMasterPass(txt)
        }}
        onSubmitEditing={handleConfirm}
        style={{
          marginTop: 10,
        }}
      />

      <Button
        text={translate('common.confirm')}
        disabled={isLoading || !masterPass.trim()}
        loading={isLoading}
        onPress={handleConfirm}
        style={{
          marginTop: 30,
        }}
      />
    </BottomModal>
  )
}
