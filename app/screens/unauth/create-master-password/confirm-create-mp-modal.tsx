import React from "react"
import { Image, View } from "react-native"
import { observer } from "mobx-react-lite"
import { Text, Button, Modal } from "../../../components"
import { useMixins } from "../../../services/mixins"


type Props = {
  isCreating: boolean
  isOpen: boolean
  onClose: () => void
  onNext: () => void
}


export const ConfirmCreateMPModal = observer((props: Props) => {
  const { isOpen, onClose, onNext, isCreating } = props
  const { translate } = useMixins()

  // ------------------ Params -----------------------

  // ------------------ Methods ----------------------

  // ------------------------------ RENDER -------------------------------

  return (
    <Modal
      disableHeader
      isOpen={isOpen}
      onClose={onClose}
      ignoreBackgroundPress={true}
    >
      <View style={{ alignItems: "center" }}>
        <Text preset="largeHeader" text={translate('confirm_create_master_pass.title')} style={{ fontSize: 32 }} />
        <Image source={require('./important.png')} style={{ width: 120, height: 120 }} />
        <Text
          preset="black"
          text={translate('confirm_create_master_pass.desc')}
          style={{ textAlign: "center", fontSize: 14 }}
        />
      </View>

      <Button
        isDisabled={isCreating}
        isLoading={isCreating}
        textStyle={{textAlign: "center"}}
        text={translate('confirm_create_master_pass.next_btn')}
        onPress={onNext}
        style={{ marginVertical: 16 }}
      />
      <Button
        isDisabled={isCreating}
        preset="link"
        text={translate('confirm_create_master_pass.back_btn')}
        onPress={onClose}
        textStyle={{ textAlign: "center", fontSize: 14 }}
      />
    </Modal>
  )
})
