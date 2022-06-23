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
  isOpen?: boolean
  onClose?: () => void
  cipherIds?: string[]
  onSuccess?: () => void
}

export const ShareModal = observer((props: Props) => {
  const { isOpen, onClose, cipherIds, onSuccess } = props
  const { cipherStore } = useStores()
  const { translate, color } = useMixins()
  const { shareCipher, shareMultipleCiphers } = useCipherDataMixins()

  const selectedCipher: CipherView = cipherStore.cipherView
  const shareTypes = [
    // {
    //   label: translate('shares.share_type.only_fill'),
    //   value: 'only_fill'
    // },
    {
      label: translate('shares.share_type.view'),
      value: 'view'
    },
    {
      label: translate('shares.share_type.edit'),
      value: 'edit'
    }
  ]

  // --------------- PARAMS ----------------

  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [shareType, setShareType] = useState('view')

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

  // Share single/multiple
  const handleShare = async () => {
    setIsLoading(true)

    let role = AccountRoleText.MEMBER
    let autofillOnly = false
    switch (shareType) {
      case 'only_fill':
        autofillOnly = true
        break
      case 'edit':
        role = AccountRoleText.ADMIN
        break
    }

    const res = !!cipherIds
      ? await shareMultipleCiphers(cipherIds, emails, role, autofillOnly)
      : await shareCipher(selectedCipher, emails, role, autofillOnly)

    setIsLoading(false)

    if (res.kind === 'ok' || res.kind === 'unauthorized') {
      if (res.kind === 'ok') {
        onSuccess && onSuccess()
      }
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
        setShareType('view')
      }}
      ignoreBackgroundPress={true}
      title={cipherIds ? translate('shares.share_x_items', { count: cipherIds.length }) : selectedCipher.name}
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
          selectionColor={color.primary}
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
              borderWidth: 1,
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
        items={shareTypes}
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
