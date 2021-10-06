import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import {Text, Button, FloatingInput } from "../../../components"
import { useMixins } from "../../../services/mixins"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { color, commonStyles } from "../../../theme"
import { useStores } from "../../../models"


type Props = {
  goBack: () => void
  nextStep: (token: string) => void
  username: string
}


export const Step3 = observer(function Step3(props: Props) {
  const { user } = useStores()
  const { translate, notify } = useMixins()
  const { goBack, nextStep, username } = props

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [code, setCode] = useState('')

  // ------------------ Methods ----------------------

  const handleRequest = async () => {
    setIsError(false)
    setIsLoading(true)
    const res = await user.resetPasswordWithCode(username, code)
    setIsLoading(false)
    if (res.kind !== 'ok') {
      setIsError(true)
      notify('error', translate('error.invalid_authorization_code'))
    } else {
      const urlArray = res.data.reset_password_url.split('/')
      nextStep(urlArray[urlArray.length - 1])
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
          text={translate('forgot_password.enter_code')}
        />
      </View>

      <FloatingInput
        isInvalid={isError}
        label={translate('forgot_password.enter_code_here')}
        value={code}
        onChangeText={setCode}
        style={{ marginTop: 10 }}
      />

      <Button
        isLoading={isLoading}
        isDisabled={isLoading || !code}
        text={translate("common.authenticate")}
        onPress={handleRequest}
        style={{
          width: '100%',
          marginTop: 30
        }}
      />
    </View>
  )
})
