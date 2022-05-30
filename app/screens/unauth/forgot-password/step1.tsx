import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import {Text, Button, FloatingInput } from "../../../components"
import { useMixins } from "../../../services/mixins"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { commonStyles } from "../../../theme"
import { useStores } from "../../../models"


type Props = {
  goBack: () => void
  nextStep: (methods: { type: string, data: any }[]) => void
}


export const Step1 = observer((props: Props) => {
  const { user } = useStores()
  const { translate, notify, color } = useMixins()
  const { goBack, nextStep } = props

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [username, setUsername] = useState('')

  // ------------------ Methods ----------------------

  const handleRequest = async () => {
    setIsError(false)
    setIsLoading(true)
    const res = await user.recoverAccount(username)
    setIsLoading(false)
    if (res.kind !== 'ok') {
      notify('error', translate('error.no_associated_account'))
    } else {
      nextStep(res.data)
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
          text={translate('forgot_password.title')}
        />
      </View>

      <FloatingInput
        isInvalid={isError}
        label={translate('forgot_password.username_or_email')}
        value={username}
        onChangeText={setUsername}
        onSubmitEditing={handleRequest}
        style={{ marginTop: 20 }}
      />

      <Button
        isLoading={isLoading}
        isDisabled={isLoading || !username}
        text={translate("forgot_password.request")}
        onPress={handleRequest}
        style={{
          width: '100%',
          marginTop: 30
        }}
      />
    </View>
  )
})
