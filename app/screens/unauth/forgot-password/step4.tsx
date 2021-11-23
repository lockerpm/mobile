import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import {Text, Button, FloatingInput } from "../../../components"
import { useMixins } from "../../../services/mixins"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { color as colorLight, colorDark, commonStyles } from "../../../theme"
import { useStores } from "../../../models"


type Props = {
  goBack: () => void
  nextStep: () => void
  token: string
}


export const Step4 = observer(function Step4(props: Props) {
  const { user, uiStore } = useStores()
  const { translate, notify, notifyApiError } = useMixins()
  const { goBack, nextStep, token } = props
  const color = uiStore.isDark ? colorDark : colorLight

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // ------------------ Methods ----------------------

  const handleSubmitNewPassword = async () => {
    setIsError(false)
    setIsLoading(true)
    const res = await user.setNewPassword(password, token)
    setIsLoading(false)
    if (res.kind !== 'ok') {
      notifyApiError(res)
    } else {
      notify('success', translate('forgot_password.password_updated'))
      nextStep()
    }
  }

  // ------------------------------ RENDER -------------------------------

  return (
    <View>
      <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
        <Button
          preset="link"
          onPress={() => goBack()}
          style={{ marginRight: 15 }}
        >
          <IoniconsIcon 
            name="md-arrow-back"
            size={26} 
            color={color.title} 
          />
        </Button>
        <Text
          preset="header"
          text={translate('forgot_password.set_new_password')}
        />
      </View>

      <FloatingInput
        isPassword
        isInvalid={isError}
        label={translate('forgot_password.new_password')}
        value={password}
        onChangeText={setPassword}
        style={{ marginTop: 20 }}
      />

      <FloatingInput
        isPassword
        isInvalid={isError || (password && confirmPassword && (password !== confirmPassword))}
        label={translate('forgot_password.confirm_new_password')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={{ marginTop: 10 }}
      />

      <Button
        isLoading={isLoading}
        isDisabled={isLoading || !(password && confirmPassword === password)}
        text={translate("common.submit")}
        onPress={handleSubmitNewPassword}
        style={{
          width: '100%',
          marginTop: 40
        }}
      />
    </View>
  )
})
