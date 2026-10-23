import { useState } from "react"
import { Platform, StyleSheet, View } from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"

import { BottomModalContainer, BottomModalHeader, Button, TextInput } from "app/components/cores"
import { useStores } from "app/models"
import { useToast } from "app/services/utils"
import { RelayAddress } from "app/static/types"
import { AppEventType, EventBus } from "app/utils/eventBus"

interface Props {
  onClose: () => void
  item: RelayAddress
}

export const EditDescription = ({ onClose, item }: Props) => {
  const { toolStore } = useStores()
  const { notifyApiError } = useToast()

  // --------------- PARAMS ----------------

  const initialDescription = item.description ?? ""
  const [description, setDescription] = useState(initialDescription)
  const [isLoading, setIsLoading] = useState(false)

  const newDescription = description.trim()
  const isChanged = newDescription !== initialDescription.trim()

  // --------------- METHODS ----------------

  const handleSave = async () => {
    setIsLoading(true)
    const res = await toolStore.updateRelayDescription(item.id, newDescription)
    setIsLoading(false)
    if (res.kind !== "ok") {
      notifyApiError(res)
      return
    }
    EventBus.emit(AppEventType.PRIVATE_RELAY_UPDATE, { ...item, description: newDescription })
    onClose()
  }

  // --------------- RENDER ----------------

  return (
    <BottomModalContainer>
      <BottomModalHeader tx="private_relay:description_modal.title" onClose={onClose} />

      <Animated.View entering={FadeInDown} style={styles.container}>
        <TextInput
          animated
          multiline
          autoFocus
          labelTx="private_relay:description_modal.label"
          placeholderTx="private_relay:description_modal.placeholder"
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.actions}>
          <Button
            tx="common:save"
            loading={isLoading}
            disabled={!isChanged || isLoading}
            onPress={handleSave}
          />
        </View>
      </Animated.View>
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  actions: {
    marginBottom: Platform.OS === "ios" ? 0 : 16,
    marginTop: 16,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
})
