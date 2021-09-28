import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { Layout, AutoImage as Image, Text, FloatingInput, Button } from "../../../components";
import { useMixins } from "../../../services/mixins"
import { commonStyles } from "../../../theme"
import { APP_ICON } from "../../../common/mappings"

export const SignupScreen = observer(function SignupScreen() {
  const { user } = useStores()
  const navigation = useNavigation()
  const { translate } = useMixins()

  // ---------------- PARAMS ---------------------

  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullname, setFullname] = useState('')
  const [org, setOrg] = useState('')
  const [country, setCountry] = useState('')
  const [phone, setPhone] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  // ---------------- COMPUTED ---------------------

  const formValidated = email && password && (password === confirmPassword) && fullname && agreed

  // ---------------- METHODS ---------------------

  const handleRegister = () => {

  }

  return (
    <Layout
      footer={(
        <View
          style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
            marginTop: 12,
            marginBottom: 24
          }]}
        >
          <Text
            text={translate("signup.has_account")}
            style={{
              marginRight: 8,
            }}
          />
          <Button
            preset="link"
            text={translate("common.login")}
            onPress={() => navigation.navigate("login")}
          />
        </View>
      )}
    >
      <View style={{ alignItems: 'center', paddingTop: '10%' }}>
        <Image source={APP_ICON.icon} style={{ height: 63 }} />

        {/* Username input */}
        <FloatingInput
          label={translate('common.email')}
          onChangeText={setEmail}
          value={email}
          style={{ width: '100%' }}
        />
        {/* Username input end */}

        {/* Password input */}
        <FloatingInput
          isPassword
          label={translate('common.password')}
          onChangeText={setPassword}
          value={password}
          style={{ width: '100%' }}
        />
        {/* Password input end */}

        {/* Confirm Password input */}
        <FloatingInput
          isPassword
          label={translate('signup.confirm_password')}
          onChangeText={setConfirmPassword}
          value={confirmPassword}
          style={{ width: '100%' }}
        />
        {/* Confirm Password input end */}

        {/* Full name input */}
        <FloatingInput
          label={translate('common.fullname')}
          onChangeText={setFullname}
          value={fullname}
          style={{ width: '100%' }}
        />
        {/* Full name input end */}

        {/* Org input */}
        <FloatingInput
          label={translate('common.organization')}
          onChangeText={setOrg}
          value={org}
          style={{ width: '100%' }}
        />
        {/* Org input end */}

        <Button
          isLoading={isLoading}
          isDisabled={isLoading || !formValidated}
          text={translate("common.sign_up")}
          onPress={handleRegister}
          style={{
            width: '100%',
            marginTop: 20
          }}
        />
      </View>
    </Layout>
  )
})
