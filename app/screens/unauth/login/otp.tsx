import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import {Text, Button, FloatingInput } from "../../../components"
import { useMixins } from "../../../services/mixins"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { color as colorLight, colorDark, commonStyles, fontSize } from "../../../theme"
import { Checkbox } from "react-native-ui-lib"
import { useStores } from "../../../models"


type Props = {
  goBack: () => void
  method: string
  email?: string
  username: string
  password: string
  onLoggedIn: () => void
}


export const Otp = observer(function Otp(props: Props) {
  const { user, uiStore } = useStores()
  const { translate, notify } = useMixins()
  const { goBack, method, email, username, password, onLoggedIn } = props
  const color = uiStore.isDark ? colorDark : colorLight

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [otp, setOtp] = useState('')
  const [saveDevice, setSaveDevice] = useState(false)

  // ------------------ Methods ----------------------

  const handleAuthenticate = async () => {
    setIsError(false)
    setIsLoading(true)
    const res = await user.login({
      username,
      password,
      method,
      otp,
      save_device: saveDevice
    }, true)
    setIsLoading(false)
    if (res.kind === 'ok') {
      onLoggedIn()
    } else {
      notify('error', translate('error.login_failed'))
      setIsError(true)
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
          text={translate('login.enter_code')}
        />
      </View>

      <Text
        text={
          method === 'mail' 
            ? translate('login.from_email', { email })
            : translate('login.from_authenticator')
        }
        preset="black"
        style={{
          marginBottom: 10,
          marginTop: 30
        }}
      />

      <FloatingInput
        isInvalid={isError}
        label={translate('login.enter_code_here')}
        value={otp}
        onChangeText={setOtp}
        onSubmitEditing={handleAuthenticate}
      />

      <Checkbox
        value={saveDevice}
        accessibilityLabel={'saveDevice'}
        color={color.primary}
        label={translate('login.save_device')}
        onValueChange={setSaveDevice}
        style={{
          marginTop: 20,
          marginBottom: 20
        }}
        labelStyle={{
          color: color.textBlack,
          fontSize: fontSize.p
        }}
      />

      <Button
        isLoading={isLoading}
        isDisabled={isLoading || !otp}
        text={translate("common.authenticate")}
        onPress={handleAuthenticate}
        style={{
          width: '100%',
          marginTop: 10
        }}
      />
    </View>
  )
})
