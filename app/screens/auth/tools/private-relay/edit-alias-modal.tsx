import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { useMixins } from "../../../../services/mixins"
import { Button, Modal, Text } from "../../../../components"
import { fontSize } from "../../../../theme"
import { TextInput, View } from "react-native"
import { RelayAddress } from "../../../../services/api"
import { useStores } from "../../../../models"


interface Props {
  isOpen?: boolean,
  onClose?: () => void
  item: RelayAddress
  onEdit: () => void
}

export const EditAliasModal = observer((props: Props) => {
  const { isOpen, onClose, item, onEdit } = props
  const { translate, color } = useMixins()
  const { toolStore } = useStores()
  // --------------- PARAMS ----------------

  const [isLoading, setIsLoading] = useState(false)
  const [newAddress, setNewAddress] = useState("")
  const [updateError, setUpdateError] = useState("")

  // --------------- COMPUTED ----------------

  // --------------- METHODS ----------------

  const handleEdit = async () => {
    setIsLoading(true)
    const res = await toolStore.updateRelayAddress(item.id, newAddress.toLowerCase())
    if (res.kind === "ok") {
      onClose()
      onEdit()
    } else {
      if (res.kind === "bad-data") {
        const errorData: {
          details?: {
            [key: string]: string[]
          }
          code: string
          message?: string
        } = res.data
        let errorMessage = ''
        if (errorData.details) {
          for (let key of Object.keys(errorData.details)) {
            if (errorData.details[key][0]) {
              if (!errorMessage) {
                errorMessage = errorData.details[key][0]
              }
            }
          }
        }
        setUpdateError(errorMessage)
      }
    }

    setIsLoading(false)
  }

  // --------------- EFFECT ----------------'

  useEffect(() => {
    setUpdateError("")
    setNewAddress("")
  }, [isOpen])

  // --------------- RENDER ----------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={translate('private_relay.edit_modal.titel')}
    >
      <View>
        <Text
          text={translate('private_relay.edit_modal.current')}
          style={{
            marginTop: 10,
            marginBottom: 4,
            fontSize: fontSize.small
          }}
        />

        <Text
          preset="black"
          text={item.full_address}
        />

        <Text
          text={translate('private_relay.edit_modal.new')}
          style={{
            marginTop: 24,
            marginBottom: 4,
            fontSize: fontSize.small
          }}
        />
        {/* <Text
          text={translate('private_relay.edit_warning', {alias: item.full_address})}
          style={{
            marginTop: 4,
            marginBottom: 4,
            fontSize: 12
          }}
        /> */}
        <View style={{
          borderWidth: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: 44,
          borderColor: color.line,
          borderRadius: 8,
          paddingRight: 12,
          paddingLeft: 12,
        }}>
          <TextInput
            value={newAddress}
            onChangeText={(text: string) => {
              setNewAddress(text)
              if (updateError !== "") setUpdateError("")
            }}
            placeholder={"... "}
            placeholderTextColor={color.text}
            selectionColor={color.primary}
            style={{
              flex: 5,
              color: color.textBlack,
              fontSize: fontSize.p,
            }}
          />
          <Text text={item.full_address.replace(item.address, "")} style={{
            marginLeft: 2,
            right: 0
          }} />
        </View>
      </View>

      <View style={{ height: 40 }}>
        <Text
          numberOfLines={2}
          text={updateError}
          style={{ color: color.error, fontSize: fontSize.small }}
        />
      </View>

      <Button
        text={translate('common.save')}
        isDisabled={isLoading || !newAddress}
        isLoading={isLoading}
        onPress={handleEdit}
        style={{
          width: '100%',
        }}
      />
    </Modal>
  )
})
