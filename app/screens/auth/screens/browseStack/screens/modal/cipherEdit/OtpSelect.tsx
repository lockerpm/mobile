import { Dimensions, ViewStyle } from "react-native"
import { CipherAppView } from "app/static/types"
import { BottomModalContainer, BottomModalHeader } from "app/components/cores"
import { observer } from "mobx-react-lite"

import { OtpList } from "@/components/ciphers"
import { AppEventType, EventBus } from "@/utils/eventBus"

const height = Dimensions.get("window").height

type Props = {
  onClose: () => void
}

export const OtpSelect = observer(({ onClose }: Props) => {
  const onSelect = (item: CipherAppView) => {
    EventBus.emit(AppEventType.CIPHER_EDIT_OTP_SELECT, item.notes)
    onClose()
  }
  const setCount = (_: number) => {
    //
  }
  return (
    <BottomModalContainer
      preset="default"
      style={{
        height: height * 0.7,
      }}
    >
      <BottomModalHeader tx="authenticator:title" style={$header} onClose={onClose} />
      <OtpList isPasswordEdit setOtpCount={setCount} openActionMenu={onSelect} />
    </BottomModalContainer>
  )
})

const $header: ViewStyle = {
  marginBottom: 8,
}
