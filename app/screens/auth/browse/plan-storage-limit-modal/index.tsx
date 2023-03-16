import { StackActions, useNavigation } from "@react-navigation/native"
import React from "react"
import { Image } from "react-native"
import { Button, Modal, Text } from "../../../../components"
import { useMixins } from "../../../../services/mixins"

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const PlanStorageLimitModal = ({ isOpen, onClose }: Props) => {
  const { translate, color } = useMixins()
  const navigation = useNavigation()
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      style={{
        marginTop: 12,
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: color.block,
      }}
    >
      <Text
        preset="bold"
        text={translate("error.limit_storage")}
        style={{
          maxWidth: "100%",
          textAlign: "center",
        }}
      />
      <Image
        source={require("../../menu/manage-plan/assets/Locker.png")}
        style={{ height: "50%", width: "50%" }}
        resizeMode="contain"
      />
      <Text
        preset="black"
        text={translate("payment.benefit.locker")}
        style={{ textAlign: "center", lineHeight: 24, marginBottom: 12 }}
      />
      <Button
        preset="link"
        text={translate('common.upgrade_now')}
        textStyle={{
          fontSize: 24,
          textDecorationLine: "underline",
        }}
        onPress={() => {
          onClose()
          navigation.dispatch(
            StackActions.replace('payment')
          );
        }}
      />
    </Modal>
  )
}
