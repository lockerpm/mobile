import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Button, Modal } from "../../../../components"
import { useMixins } from "../../../../services/mixins"
import { useStores } from "../../../../models"
import { TextInput } from "react-native"
import { fontSize } from "../../../../theme"


type Props = {
  isOpen: boolean
  onClose: () => void
}


export const FeedbackModal = observer((props: Props) => {
  const { isOpen, onClose } = props
  const { translate, notify, notifyApiError, color } = useMixins()
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
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder={translate('help.tell_us')}
        multiline
        autoCapitalize="none"
        placeholderTextColor={color.text}
        style={{
          marginTop: 10,
          marginBottom: 30,
          borderColor: color.line,
          borderWidth: 1,
          borderRadius: 16,
          fontSize: fontSize.p,
          color: color.textBlack,
          minHeight: 100,
          maxHeight: 100,
          paddingHorizontal: 16,
          textAlignVertical: 'top'
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
