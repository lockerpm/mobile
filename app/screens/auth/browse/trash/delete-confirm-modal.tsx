import React, { useState } from "react"
import { Modal } from "native-base"
import { Button } from "../../../../components/button/button"
import { Text } from "../../../../components/text/text"
import { AutoImage as Image } from "../../../../components/auto-image/auto-image"
import { color } from "../../../../theme"
import { translate } from "../../../../i18n"

interface Props {
  isOpen?: boolean,
  onClose?: Function,
  onConfirm?: Function,
  title?: string,
  desc?: string,
  btnText?: string
}

export const DeleteConfirmModal = (props: Props) => {
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
      <Modal.Content>
        <Modal.CloseButton />

        {/* Body */}
        <Modal.Body style={{ alignItems: 'center' }}>
          <Image
            source={require('./trash.png')}
            style={{ height: 110 }}
          />
          <Text
            preset="black"
						text={title || translate('trash.delete_item')}
						style={{ fontSize: 18, marginBottom: 5, marginTop: 15 }}
          />
					<Text
						text={desc || translate('trash.delete_desc')}
						style={{ textAlign: 'center', fontSize: 12 }}
					/>
        </Modal.Body>
        {/* Body end */}

        {/* Footer */}
        <Modal.Footer style={{ marginRight: 20, marginBottom: 16, paddingRight: 0 }}>
          <Button
            isNativeBase
						colorScheme="csError"
            disabled={isLoading}
            isLoading={isLoading}
            onPress={handleConfirm}
            style={{
              width: '100%'
            }}
          >
						<Text
							text={btnText || translate('common.delete')}
							style={{ color: color.palette.white }}
						/>
					</Button>
        </Modal.Footer>
        {/* Footer end */}
      </Modal.Content>
    </Modal>
  )
}
