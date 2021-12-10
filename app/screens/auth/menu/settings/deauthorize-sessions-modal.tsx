import React, { useState } from "react"
import { FloatingInput, Button, Modal, Text } from "../../../../components"
import { observer } from "mobx-react-lite"
import { useMixins } from "../../../../services/mixins"
import { View } from "react-native"
import { useStores } from "../../../../models"
import { useCoreService } from "../../../../services/core-service"

interface Props {
  isOpen?: boolean,
  onClose?: () => void,
  navigation: any
}

export const DeauthorizeSessionsModal = observer((props: Props) => {
  const { isOpen, onClose, navigation } = props
  const { user } = useStores()
  const { notify, translate, notifyApiError, logout, lock, color } = useMixins()
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
    if (storedKeyHash != null && keyHash != null && storedKeyHash === keyHash) {
      await handleDeauth(keyHash)
    } else {
      setIsLoading(false)
      setIsError(true)
      setCount(count + 1)
      if (count > 5) {
        notify('error', translate('error.too_many_failed_attempts'))
        await lock()
        navigation.navigate('lock')
      }
    }
  }

  const handleDeauth = async (hashedPassword: string) => {
    const res = await user.deauthorizeSessions(hashedPassword)

    setIsLoading(false)

    if (res.kind === 'ok') {
      notify('success', translate('settings.deauthorize_sessions_success'))
      setMasterPass('')
      onClose()
      await logout()
      navigation.navigate('login')
    } else {
      notifyApiError(res)
      if (res.kind === 'unauthorized') {
        onClose()
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={translate('settings.deauthorize_sessions')}
    >
      <Text
        text={translate('settings.deauthorize_sessions_desc')}
        style={{
          marginTop: 20,
          marginBottom: 20
        }}
      />

      <View style={{
        borderRadius: 5,
        borderTopWidth: 1,
        borderBottomWidth: 0.5,
        borderRightWidth: 1,
        borderLeftWidth: 4,
        borderTopColor: color.line,
        borderBottomColor: color.line,
        borderRightColor: color.line,
        borderLeftColor: color.error,
        marginTop: 20,
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 8
      }}>
        <Text
          text={translate('settings.deauthorize_sessions_warning')}
        />
      </View>

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
      />

      <Button
        preset="error"
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
