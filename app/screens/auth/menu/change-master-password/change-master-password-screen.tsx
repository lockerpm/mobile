import React, { useState } from "react"
import { View } from "react-native"
import { Layout, Button, Header, FloatingInput, PasswordStrength } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles } from "../../../../theme"
import { useMixins } from "../../../../services/mixins"
import { useCipherHelpersMixins } from "../../../../services/mixins/cipher/helpers"
import { useCipherAuthenticationMixins } from "../../../../services/mixins/cipher/authentication"


export const ChangeMasterPasswordScreen = () => {
  const navigation = useNavigation()
  const { translate, color, validateMasterPassword } = useMixins()
  const { getPasswordStrength } = useCipherHelpersMixins()
  const { changeMasterPassword } = useCipherAuthenticationMixins()

  // -------------- PARAMS --------------

  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(-1)
  const [current, setCurrent] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')

  // -------------- COMPUTED --------------

  const isError = !!newPass && !!confirm && (newPass !== confirm)
  const masterPasswordError = validateMasterPassword(newPass).error
  const isReady = !masterPasswordError && !isError && !!current && !!newPass && !!confirm

  // -------------- METHODS --------------

  const handleChangePassword = async () => {
    setIsLoading(true)
    const res = await changeMasterPassword(current, newPass)
    if (res.kind === 'ok') {
      navigation.navigate('login')
    }
    setIsLoading(false)
  }

  // -------------- RENDER --------------

  return (
    <Layout
      header={(
        <Header
          goBack={() => navigation.goBack()}
          title={translate('change_master_pass.title')}
          right={(<View style={{ width: 10 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <View style={[commonStyles.GRAY_SCREEN_SECTION, { 
        paddingVertical: 16,
        backgroundColor: color.background
      }]}>
        <FloatingInput
          isPassword
          label={translate('change_master_pass.current')}
          value={current}
          onChangeText={setCurrent}
          style={{ marginBottom: 20 }}
        />

        <FloatingInput
          isPassword
          isInvalid={isError || !!masterPasswordError}
          errorText={masterPasswordError || translate('common.password_not_match')}
          label={translate('change_master_pass.new')}
          value={newPass}
          onChangeText={(text) => {
            setNewPass(text)
            const strength = getPasswordStrength(text)
            setPasswordStrength(strength ? strength.score : -1)
          }}
        />

        {
          !!newPass && (
            <PasswordStrength value={passwordStrength} style={{ marginTop: 15 }} />
          )
        }

        <FloatingInput
          isPassword
          isInvalid={isError}
          errorText={translate('common.password_not_match')}
          label={translate('change_master_pass.confirm')}
          value={confirm}
          onChangeText={setConfirm}
          style={{ marginBottom: 30, marginTop: 20 }}
        />

        <Button
          isLoading={isLoading}
          isDisabled={isLoading || !isReady}
          onPress={handleChangePassword}
          text={translate('common.save')}
        />
      </View>
    </Layout>
  )
}
