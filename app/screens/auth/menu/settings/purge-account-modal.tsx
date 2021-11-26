import React, { useState } from "react"
import { FloatingInput, Button, Modal, Text } from "../../../../components"
import { observer } from "mobx-react-lite"
import { useMixins } from "../../../../services/mixins"
import { View } from "react-native"
import { color as colorLight, colorDark } from "../../../../theme"
import { useStores } from "../../../../models"
import { useCoreService } from "../../../../services/core-service"

interface Props {
  isOpen?: boolean,
  onClose?: () => void,
  navigation: any
}

export const PurgeAccountModal = observer((props: Props) => {
  const { isOpen, onClose, navigation } = props
  const { user, uiStore } = useStores()
  const { notify, translate, notifyApiError, lock } = useMixins()
  const { cryptoService } = useCoreService()
  const color = uiStore.isDark ? colorDark : colorLight

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
      await handlePurge(keyHash)
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

  const handlePurge = async (hashedPassword: string) => {
    const res = await user.purgeAccount(hashedPassword)

    setIsLoading(false)

    if (res.kind === 'ok') {
      notify('success', translate('settings.delete_all_items_success'))
      setMasterPass('')
      onClose()
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
      title={translate('settings.delete_all_items')}
    >
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
          preset="bold"
          text={translate('settings.delete_all_items')}
          style={{
            marginBottom: 8,
            color: color.error
          }}
        />
        <Text
          text={translate('settings.delete_all_items_warning')}
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
