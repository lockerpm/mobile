import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Button, FloatingInput, Modal } from "../../../../components"
import { useMixins } from "../../../../services/mixins"
import { useStores } from "../../../../models"


type Props = {
  isOpen: boolean
  onClose: () => void
}


export const FeedbackModal = observer(function FeedbackModal(props: Props) {
  const { isOpen, onClose } = props
  const { translate, notify, notifyApiError } = useMixins()
  const { user } = useStores()

  // ------------------------ PARAMS -------------------------

  const [isLoading, setIsLoading] = useState(false)
  const [content, setContent] = useState('')

  // ------------------------ METHODS -------------------------

  const handleSubmit = async () => {
    if (!content.trim()) {
      return
    }

    setIsLoading(true)
    const res = await user.feedback(content)
    if (res.kind === 'ok') {
      setContent('')
      onClose()
      notify('success', translate('help.thank_you'))
    } else {
      notifyApiError(res)
    }
    setIsLoading(false)
  }

  // ------------------------ RENDER -------------------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={translate('help.feedback')}
    >
      <FloatingInput
        value={content}
        onChangeText={setContent}
        label={translate('help.tell_us')}
        onSubmitEditing={handleSubmit}
        style={{
          marginTop: 10,
          marginBottom: 30
        }}
      />

      <Button
        isLoading={isLoading}
        isDisabled={isLoading || !content.trim()}
        text={translate('common.submit')}
        onPress={handleSubmit}
      />
    </Modal>
  )
})
