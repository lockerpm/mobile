import React, { useState } from "react"
import { Button } from "../../../../components/button/button"
import { Text } from "../../../../components/text/text"
import { AutoImage as Image } from "../../../../components/auto-image/auto-image"
import { color, fontSize } from "../../../../theme"
import { Modal } from "../../../../components/modal/modal"
import { View } from "react-native"
import { useMixins } from "../../../../services/mixins"

interface Props {
  isOpen?: boolean,
  onClose?: () => void,
  onConfirm?: Function,
  title?: string,
  desc?: string,
  btnText?: string
}

export const DeleteConfirmModal = (props: Props) => {
  const { translate } = useMixins()
  const { isOpen, onClose, onConfirm, title, desc, btnText } = props
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    if (onConfirm) {
      await onConfirm()
    }
    setIsLoading(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <View style={{ alignItems: 'center' }}>
        <Image
          source={require('./trash.png')}
          style={{ height: 110, width: 100 }}
        />
        <Text
          preset="black"
          text={title || translate('trash.delete_item')}
          style={{ fontSize: fontSize.h4, marginBottom: 10, marginTop: 20 }}
        />
        <Text
          text={desc || translate('trash.delete_desc')}
          style={{ textAlign: 'center', fontSize: fontSize.small }}
        />
      </View>

      <Button
        preset="error"
        disabled={isLoading}
        isLoading={isLoading}
        onPress={handleConfirm}
        style={{
          width: '100%',
          marginTop: 30
        }}
      >
        <Text
          text={btnText || translate('common.delete')}
          style={{ color: color.white }}
        />
      </Button>
    </Modal>
  )
}
