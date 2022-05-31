import React, { useState } from "react"
import {  View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { Layout, AutoImage as Image, Text, FloatingInput, Button } from "../../../components";
import { useMixins } from "../../../services/mixins"
import {  commonStyles} from "../../../theme"


type Props = {
  userRes: any
  token?: string
  onDone?: (code: string) => void
}

export const SocialSignedUpModal = (props: Props) => {
  const { user } = useStores()
  const navigation = useNavigation()
  const { translate, notify, notifyApiError } = useMixins()

  // ---------------- PARAMS ---------------------

  const [isScreenLoading, setIsScreenLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')



  // ---------------- COMPUTED ---------------------

  const formValidated = username && password && (password === confirmPassword)

  // ---------------- METHODS ---------------------

  const handleChange = async () => {
    setIsLoading(true)
    const res = await user.setSocialPassword(
      password,
      props.token,
      username,
    )
    setIsLoading(false)
    if (res.kind === 'ok') {
      notify('success', translate("signup.update_pw_successful"), 5000)
      navigation.navigate('createMasterPassword')
    } else {
      notifyApiError(res)
    }
  }


  // ---------------- RENDER ---------------------

  return (
    <Layout
      isOverlayLoading={isScreenLoading}
      header={(
        <View style={{ flexDirection: "row-reverse" }}>
          <Button preset="link" text="Ignore" onPress={() => navigation.navigate('createMasterPassword')}/>
        </View>
      )}
      footer={(
        <View
          style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
            marginTop: 12,
            justifyContent: 'center'
          }]}
        >
        </View>
      )}
    >

      <View style={{ alignItems: 'center', paddingTop: '10%' }}>
        <Image
          source={{ uri: props.userRes.avatar }}
          style={{ height: 63, width: 63, marginBottom: 10, marginTop: 30, borderRadius: 5 }}
        />

        <Text
          preset="header"
          text={props.userRes.email}
          style={{ marginBottom: 20 }}
        />

        {/* Username input */}
        <FloatingInput
          label={translate('common.username')}
          onChangeText={setUsername}
          value={username}
          style={{ width: '100%', marginBottom: 10 }}
        />
        {/* Username input end */}

        {/* Password input */}
        <FloatingInput
          isPassword
          label={translate('common.password')}
          onChangeText={setPassword}
          value={password}
          style={{ width: '100%', marginBottom: 10 }}
        />
        {/* Password input end */}

        {/* Confirm Password input */}
        <FloatingInput
          isPassword
          label={translate('signup.confirm_password')}
          onChangeText={setConfirmPassword}
          value={confirmPassword}
          style={{ width: '100%', marginBottom: 10 }}
        />
        {/* Confirm Password input end */}

        <Button
          isLoading={isLoading}
          isDisabled={isLoading || !formValidated}
          text={translate("common.sign_up")}
          onPress={handleChange}
          style={{
            width: '100%',
            marginTop: 30,
            marginBottom: 20
          }}
        />
      </View>
    </Layout>
  )
}
