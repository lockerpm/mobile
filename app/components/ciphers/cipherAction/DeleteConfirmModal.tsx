import React, { useState } from "react"
import { View, Image } from "react-native"
import { BottomModal, Button, Text } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  desc?: string
  btnText?: string
}

const TRASH = require("assets/images/intro/trash.png")

export const DeleteConfirmModal = (props: Props) => {
  const { isOpen, onClose, onConfirm, title, desc, btnText } = props
  const { translate } = useAppLocale()
  const { colors } = useTheme()

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
    <BottomModal isOpen={isOpen} onClose={onClose} title={title || translate("trash.delete_item")}>
      <View style={{ alignItems: "center" }}>
        <Image resizeMode="contain" source={TRASH} style={{ height: 110, width: 100 }} />
        <Text
          preset="label"
          size="base"
          text={desc || translate("trash.delete_desc")}
          style={{ textAlign: "center" }}
        />
      </View>

      <Button
        preset="teriatary"
        disabled={isLoading}
        loading={isLoading}
        onPress={handleConfirm}
        teriataryBackground={colors.error}
        style={{
          width: "100%",
          marginTop: 30,
        }}
      >
        <Text
          preset="bold"
          text={btnText || translate("common.delete")}
          style={{ color: colors.white }}
        />
      </Button>
    </BottomModal>
  )
}
