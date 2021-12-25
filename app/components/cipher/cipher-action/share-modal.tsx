import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../models"
import { useMixins } from "../../../services/mixins"
import { TEAM_CIPHER_EDITOR } from "../../../config/constants"
import { Modal } from "../../modal/modal"
import { DropdownPicker } from "../../dropdown-picker/dropdown-picker"
import { Button } from "../../button/button"
import { Text } from "../../text/text"
import { fontSize } from "../../../theme"
import { CipherView } from "../../../../core/models/view"
import { useCoreService } from "../../../services/core-service"
import { CipherRequest } from "../../../../core/models/request/cipherRequest"
import { PolicyType } from "../../../services/api"
import { CipherType } from "../../../../core/enums"
import { useCipherHelpersMixins } from "../../../services/mixins/cipher/helpers"


interface Props {
  isOpen?: boolean,
  onClose?: () => void
}

export const ShareModal = observer((props: Props) => {
  const { isOpen, onClose } = props
  const { user, cipherStore, collectionStore } = useStores()
  const { notify, translate, notifyApiError } = useMixins()
  const { getPasswordStrength } = useCipherHelpersMixins()
  const { cipherService } = useCoreService()

  const selectedCipher: CipherView = cipherStore.cipherView
  const teams = user.teams.filter((team) => {
    return TEAM_CIPHER_EDITOR.includes(team.role)
  }).map((team) => {
    return {
      label: team.name,
      value: team.id
    }
  })

  // --------------- PARAMS ----------------

  const [isLoading, setIsLoading] = useState(false)

  const [owner, setOwner] = useState(null)
  const [owners, setOwners] = useState(teams)
  const [collectionIds, setCollectionIds] = useState([])
  const [writeableCollections, setWriteableCollections] = useState([])
  const [policy, setPolicy] = useState<PolicyType>(null)

  // --------------- COMPUTED ----------------

  const passwordStrength = (() => {
    if (selectedCipher.login) {
      return getPasswordStrength(selectedCipher.login.password)
    }
    return { score: undefined }
  })()

  // --------------- METHODS ----------------

  const getPolicy = async (organizationId: string) => {
    setIsLoading(true)
    const res = await user.getPolicy(organizationId)
    if (res.kind === 'ok') {
      setPolicy(res.data)
    } else {
      notifyApiError(res)
      setPolicy(null)
    }
    setIsLoading(false)
  }

  const checkPolicy = (cipher: CipherView) => {
    if (cipher.type === CipherType.Login) {
      if (policy.min_password_length && cipher.login.password.length < policy.min_password_length) {
        notify('error', translate('policy.min_password_length', { length: policy.min_password_length }))
        return false
      }
      if (policy.max_password_length && cipher.login.password.length > policy.max_password_length) {
        notify('error', translate('policy.max_password_length', { length: policy.max_password_length }))
        return false
      }
      if (policy.password_composition) {
        if (policy.require_special_character) {
          const reg = /(?=.*[!@#$%^&*])/
          const check = reg.test(cipher.login.password)
          if (!check) {
            notify('error', translate('policy.requires_special'))
            return false
          }
        }
        if (policy.require_lower_case) {
          const reg = /[a-z]/
          const check = reg.test(cipher.login.password)
          if (!check) {
            notify('error', translate('policy.requires_lowercase'))
            return false
          }
        }
        if (policy.require_upper_case) {
          const reg = /[A-Z]/
          const check = reg.test(cipher.login.password)
          if (!check) {
            notify('error', translate('policy.requires_uppercase'))
            return false
          }
        }
        if (policy.require_digit) {
          const reg = /[1-9]/
          const check = reg.test(cipher.login.password)
          if (!check) {
            notify('error', translate('policy.requires_number'))
            return false
          }
        }
        if (policy.avoid_ambiguous_character) {
          const ambiguousCharacters = ['I', 'l', '1', 'O', '0']
          const check = ambiguousCharacters.some(c => cipher.login.password.includes(c))
          if (check) {
            notify('error', translate('policy.avoid_ambiguous'))
            return false
          }
        }
      }
    }
    return true
  }

  const handleShare = async () => {
    const passPolicyTest = checkPolicy(selectedCipher)
    if (!passPolicyTest) {
      return
    }

    setIsLoading(true)

    const payload = {...selectedCipher}
    payload.organizationId = owner

    const cipherEnc = await cipherService.encrypt(payload)
    const data = new CipherRequest(cipherEnc)
    const res = await cipherStore.shareCipher(
      selectedCipher.id, 
      data, 
      passwordStrength.score, 
      collectionIds
    )

    setIsLoading(false)

    if (res.kind === 'ok') {
      notify('success', translate('success.cipher_shared'))
      onClose()
    } else {
      notifyApiError(res)
      if (res.kind === 'unauthorized') {
        onClose()
      }
    }
  }

  // --------------- EFFECT ----------------

  useEffect(() => {
    if (owner) {
      setWriteableCollections(
        collectionStore.collections.filter(c => !c.readOnly && c.organizationId === owner).map(c => ({
          label: c.name,
          value: c.id
        }))
      )
      getPolicy(owner)
    } else {
      setWriteableCollections([])
      setPolicy(null)
    }
  }, [owner])

  // --------------- RENDER ----------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onOpen={() => {
        setOwner(null)
        setOwners(teams)
        setCollectionIds([])
        setWriteableCollections([])
      }}
      title={selectedCipher.name}
    >
      <Text
        text={translate('common.ownership')}
        style={{
          marginTop: 20,
          marginBottom: 10,
          fontSize: fontSize.small
        }}
      />

      <DropdownPicker
        zIndex={2000}
        zIndexInverse={1000}
        placeholder={translate('common.select')}
        emptyText={translate('error.no_team_available')}
        value={owner}
        items={owners}
        setValue={setOwner}
        setItems={setOwners}
        style={{
          marginBottom: 20
        }}
      />

      {
        owner && (
          <>
            <Text
              text={translate('common.team_folders')}
              style={{
                marginBottom: 10,
                fontSize: fontSize.small
              }}
            />

            <DropdownPicker
              multiple
              zIndex={1000}
              zIndexInverse={2000}
              emptyText={translate('error.no_collection_available')}
              placeholder={translate('common.select')}
              value={collectionIds}
              items={writeableCollections}
              setValue={setCollectionIds}
              setItems={setWriteableCollections}
              style={{
                marginBottom: 20
              }}
            />
          </>
        )
      }

      <Button
        text={translate('common.share')}
        isDisabled={isLoading || !owner || !collectionIds.length}
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
