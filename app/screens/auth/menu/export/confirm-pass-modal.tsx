import React, { useState } from "react"
import { FloatingInput, Button, Modal } from "../../../../components"
import { observer } from "mobx-react-lite"
import { useMixins } from "../../../../services/mixins"
import { useCoreService } from "../../../../services/core-service"
import { useCipherAuthenticationMixins } from "../../../../services/mixins/cipher/authentication"

interface Props {
  isOpen?: boolean,
  onClose?: () => void,
  onConfirm?: () => void,
  navigation: any
}

export const ConfirmPassModal = observer((props: Props) => {
  const { isOpen, onClose, onConfirm, navigation } = props
  const { translate, notify } = useMixins()
  const { lock } = useCipherAuthenticationMixins()
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={translate('common.enter_master_pass')}
    >
      <FloatingInput
        isPassword
        isRequired
        isInvalid={isError}
        errorText={translate('error.invalid_password')}
        label={translate('common.master_pass')}
        value={masterPass}
        onChangeText={txt => {
          setIsError(false)
          setMasterPass(txt)
        }}
        onSubmitEditing={handleConfirm}
        style={{
          marginTop: 10
        }}
      />

      <Button
        text={translate('common.confirm')}
        isDisabled={isLoading || !masterPass.trim()}
        isLoading={isLoading}
        onPress={handleConfirm}
        style={{
          width: '100%',
          marginTop: 30
        }}
      />
    </Modal>
  )
})
