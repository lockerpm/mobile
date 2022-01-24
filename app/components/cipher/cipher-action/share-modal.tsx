import React, { useState } from "react"
import { TextInput, View } from "react-native"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../models"
import { useMixins } from "../../../services/mixins"
import { Modal } from "../../modal/modal"
import { DropdownPicker } from "../../dropdown-picker/dropdown-picker"
import { Button } from "../../button/button"
import { Text } from "../../text/text"
import { commonStyles, fontSize } from "../../../theme"
import { CipherView } from "../../../../core/models/view"
import { useCipherDataMixins } from "../../../services/mixins/cipher/data"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { AccountRoleText } from "../../../config/types"


interface Props {
  isOpen?: boolean,
  onClose?: () => void
}

export const ShareModal = observer((props: Props) => {
  const { isOpen, onClose } = props
  const { cipherStore } = useStores()
  const { translate, color } = useMixins()
  const { shareCipher } = useCipherDataMixins()

  const selectedCipher: CipherView = cipherStore.cipherView
  const shareTypes = [
    translate('shares.share_type.only_fill'),
    translate('shares.share_type.view'),
    translate('shares.share_type.edit')
  ]

  // --------------- PARAMS ----------------

  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [shareType, setShareType] = useState(1)

  // --------------- COMPUTED ----------------

  const btnDisabled = isLoading || !emails.length

  // --------------- METHODS ----------------

  const addEmail = () => {
    const e = email.trim().toLowerCase()
    if (!!e && !emails.includes(e)) {
      setEmails([...emails, e])
    }
    setEmail('')
  }

  const removeEmail = (val: string) => {
    setEmails(emails.filter(e => e !== val))
  }

  const handleShare = async () => {
    setIsLoading(true)

    let role = AccountRoleText.MEMBER
    let autofillOnly = false
    switch (shareType) {
      case 0:
        autofillOnly = true
        break
      case 2:
        role = AccountRoleText.ADMIN
        break
    }
    const res = await shareCipher(selectedCipher, emails, role, autofillOnly)

    setIsLoading(false)

    if (res.kind === 'ok' || res.kind === 'unauthorized') {
      onClose()
    }
  }

  // --------------- EFFECT ----------------

  // --------------- RENDER ----------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onOpen={() => {
        setEmail('')
        setEmails([])
        setShareType(1)
      }}
      title={selectedCipher.name}
    >
      <Text
        text={translate('shares.add_emails')}
        style={{
          marginTop: 20,
          marginBottom: 10,
          fontSize: fontSize.small
        }}
      />

      <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        borderColor: color.line,
        backgroundColor: color.background,
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 10,
        marginBottom: 10
      }]}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={translate('common.email')}
          placeholderTextColor={color.text}
          onSubmitEditing={addEmail}
          style={{
            color: color.textBlack,
            fontSize: fontSize.p,
            flex: 1
          }}
        />

        <Button
          preset="link"
          onPress={addEmail}
          style={{
            marginLeft: 5,
            paddingHorizontal: 6,
            height: 50,
            alignItems: 'center'
          }}
        >
          <IoniconsIcon name="add" size={25} color={color.primary} />
        </Button>
      </View>

      {
        emails.map((e, index) => (
          <View
            key={index}
            style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
              borderRadius: 8,
              borderWidth: 0.5,
              borderColor: color.primary,
              backgroundColor: color.lightPrimary,
              paddingLeft: 10,
              marginBottom: 10
            }]}
          >
            <Text
              text={e}
              style={{
                flex: 1,
                color: color.primary
              }}
            />

            <Button
              preset="link"
              onPress={() => removeEmail(e)}
              style={{
                paddingHorizontal: 12,
                height: 30,
                alignItems: 'center'
              }}
            >
              <IoniconsIcon name="close" size={16} color={color.primary} />
            </Button>
          </View>
        ))
      }

      <Text
        text={translate('shares.share_type.label')}
        style={{
          marginTop: 10,
          marginBottom: 10,
          fontSize: fontSize.small
        }}
      />

      <DropdownPicker
        zIndex={2000}
        zIndexInverse={1000}
        placeholder={translate('common.select')}
        value={shareType}
        items={shareTypes.map((t, index) => ({ label: t, value: index }))}
        setValue={setShareType}
        setItems={() => {}}
        style={{
          marginBottom: 20
        }}
      />

      <Button
        text={translate('common.share')}
        isDisabled={btnDisabled}
        isLoading={isLoading}
        onPress={handleShare}
        style={{
          width: '100%',
          marginTop: 30
        }}
      />
    </Modal>
  )
})
