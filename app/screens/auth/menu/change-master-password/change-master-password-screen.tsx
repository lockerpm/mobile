import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Button, Header, FloatingInput, PasswordStrength } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { color, commonStyles } from "../../../../theme"
import { useMixins } from "../../../../services/mixins"
import { translate } from "../../../../i18n"


export const ChangeMasterPasswordScreen = observer(function ChangeMasterPasswordScreen() {
  const navigation = useNavigation()
  const { getPasswordStrength, changeMasterPassword } = useMixins()

  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(-1)
  const [current, setCurrent] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')

  const handleChangePassword = async () => {
    setIsLoading(true)
    const res = await changeMasterPassword(current, newPass)
    if (res.kind === 'ok') {
      navigation.navigate('lock')
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
      <View style={[commonStyles.GRAY_SCREEN_SECTION, { paddingVertical: 16 }]}>
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
          isNativeBase
          isLoading={isLoading}
          disabled={isLoading || !current || !newPass || !confirm || (newPass !== confirm)}
          onPress={handleChangePassword}
          text={translate('common.save')}
        />
      </View>
    </Layout>
  )
})
