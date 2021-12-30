import React, { useState } from "react"
import { View } from "react-native"
import { Layout, Button, Header, FloatingInput, PasswordStrength } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles } from "../../../../theme"
import { useMixins } from "../../../../services/mixins"
import { useCipherHelpersMixins } from "../../../../services/mixins/cipher/helpers"
import { useCipherAuthenticationMixins } from "../../../../services/mixins/cipher/authentication"


export const ChangeMasterPasswordScreen = function ChangeMasterPasswordScreen() {
  const navigation = useNavigation()
  const { translate, color } = useMixins()
  const { getPasswordStrength } = useCipherHelpersMixins()
  const { changeMasterPassword } = useCipherAuthenticationMixins()

  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(-1)
  const [current, setCurrent] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')

  const handleChangePassword = async () => {
    setIsLoading(true)
    const res = await changeMasterPassword(current, newPass)
    if (res.kind === 'ok') {
      navigation.navigate('login')
    }
    setIsLoading(false)
  }

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
          isInvalid={newPass !== confirm}
          label={translate('change_master_pass.confirm')}
          value={confirm}
          onChangeText={setConfirm}
          style={{ marginBottom: 30, marginTop: 20 }}
        />

        <Button
          isLoading={isLoading}
          isDisabled={isLoading || !current || !newPass || !confirm || (newPass !== confirm)}
          onPress={handleChangePassword}
          text={translate('common.save')}
        />
      </View>
    </Layout>
  )
}
