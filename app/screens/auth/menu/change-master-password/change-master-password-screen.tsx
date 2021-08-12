import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Button, Header, FloatingInput } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { color, commonStyles } from "../../../../theme"


export const ChangeMasterPasswordScreen = observer(function ChangeMasterPasswordScreen() {
  const navigation = useNavigation()
  const [current, setCurrent] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')

  return (
    <Layout
      header={(
        <Header
          goBack={() => navigation.goBack()}
          title="Change Master Password"
          right={(<View style={{ width: 10 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <View style={[commonStyles.GRAY_SCREEN_SECTION, { paddingVertical: 16 }]}>
        <FloatingInput
          isPassword
          label="Current Master Password"
          value={current}
          onChangeText={setCurrent}
          style={{ marginBottom: 20 }}
        />

        <FloatingInput
          isPassword
          label="New Master Password"
          value={newPass}
          onChangeText={setNewPass}
          style={{ marginBottom: 20 }}
        />

        <FloatingInput
          isPassword
          label="Confirm Master Password"
          value={confirm}
          onChangeText={setConfirm}
          style={{ marginBottom: 30 }}
        />

        <Button
          isNativeBase
          text="Save"
        />
      </View>
    </Layout>
  )
})
