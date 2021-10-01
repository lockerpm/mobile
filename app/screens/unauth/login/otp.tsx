import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import {Text, Button, FloatingInput } from "../../../components"
import { useMixins } from "../../../services/mixins"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { color, commonStyles, fontSize } from "../../../theme"
import { Checkbox } from "react-native-ui-lib"


type Props = {
  onSubmit: (otp: string, saveDevice?: boolean) => Promise<boolean>
  goBack: () => void
  method: string
  email?: string
}


export const Otp = observer(function Otp(props: Props) {
  const { translate } = useMixins()
  const { onSubmit, goBack, method, email } = props

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [otp, setOtp] = useState('')
  const [saveDevice, setSaveDevice] = useState(false)

  // ------------------ Methods ----------------------

  const handleAuthenticate = async () => {
    setIsError(false)
    setIsLoading(true)
    const isSuccess = await onSubmit(otp, saveDevice)
    setIsLoading(false)
    if (!isSuccess) {
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
          marginTop: 10
        }}
      />

      <FloatingInput
        isInvalid={isError}
        label={translate('login.enter_code_here')}
        value={otp}
        onChangeText={setOtp}
      />

      <Checkbox
        value={saveDevice}
        accessibilityLabel={'saveDevice'}
        color={color.palette.green}
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
