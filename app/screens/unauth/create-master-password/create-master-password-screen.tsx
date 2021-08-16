import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { AutoImage as Image, Button, Layout, Text, FloatingInput, PasswordStrength } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { color } from "../../../theme"
import { useMixins } from "../../../services/mixins"
import { useCoreService } from "../../../services/core-service"

export const CreateMasterPasswordScreen = observer(function CreateMasterPasswordScreen() {
  const navigation = useNavigation()
  const { logout } = useMixins()
  const { passwordGenerationService } = useCoreService()
  const { user } = useStores()

  // Params
  const [masterPassword, setMasterPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [hint, setHint] = useState('')

  // UI
  const [passwordStrength, setPasswordStrength] = useState(-1)
  const [isScreenLoading, setIsScreenLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const isError = !!masterPassword && !!confirmPassword && (masterPassword !== confirmPassword)
  const isReady = !isError && !!masterPassword && !!confirmPassword

  // Methods
  const handleLogout = async () => {
    setIsScreenLoading(true)
    await logout()
    setIsScreenLoading(false)
    navigation.navigate('onBoarding')
  }

  const handleCreate = () => {
    setIsCreating(true)
  }

  // Render
  return (
    <Layout
      isOverlayLoading={isScreenLoading}
      header={(
        <View style={{ alignItems: "flex-end" }}>
          <Button
            text="LOG OUT"
            textStyle={{ fontSize: 12 }}
            preset="link"
            onPress={handleLogout}
          >
          </Button>
        </View>
      )}
    >
      <View style={{ alignItems: 'center' }}>
        <Image source={require("./locker.png")} style={{ height: 63, width: 63 }} />

        <Text
          preset="header"
          style={{ marginBottom: 10, marginTop: 25 }}
        >
          Tạo Master Password
        </Text>

        <Text style={{ textAlign: 'center', fontSize: 12 }}>
          Master Password là mật khẩu mở khóa Locker của bạn. Đây là mật khẩu duy nhất bạn cần nhớ để truy cập tất cả các mật khẩu khác được lưu trữ trong Locker. Vui lòng không chia sẻ mật khẩu này với bất kỳ ai.
        </Text>

        {/* Current user */}
        <View
          style={{
            marginTop: 16,
            marginBottom: 26,
            borderRadius: 20,
            backgroundColor: color.block,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 4
          }}
        >
          <Image 
            source={{ uri: user.avatar }} 
            style={{ 
              height: 28, 
              width: 28,
              borderRadius: 14,
              backgroundColor: color.palette.white
            }} 
          />
          <Text 
            style={{ 
              fontSize: 12,
              color: color.title,
              marginHorizontal: 10
            }}
          >
            {user.email}
          </Text>
        </View>
        {/* Current user end */}

        {/* Master pass input */}
        <FloatingInput
          isPassword
          isInvalid={isError}
          label="Master Password"
          onChangeText={(text) => {
            setMasterPassword(text)
            const strength = passwordGenerationService.passwordStrength(text, ['cystack'])
            setPasswordStrength(strength ? strength.score : -1)
          }}
          value={masterPassword}
          style={{ width: '100%' }}
        />

        {
          !!masterPassword && (
            <PasswordStrength value={passwordStrength} style={{ marginTop: 15 }} />
          )
        }
        {/* Master pass input end */}

        {/* Master pass confirm */}
        <FloatingInput
          isPassword
          isInvalid={isError}
          label="Confirm Master Password"
          onChangeText={setConfirmPassword}
          value={confirmPassword}
          style={{ width: '100%', marginVertical: 20 }}
        />
        {/* Master pass confirm end */}

        {/* Hint */}
        <FloatingInput
          label="Hint (optional)"
          onChangeText={setHint}
          value={hint}
          style={{ width: '100%', marginBottom: 20 }}
        />
        {/* Hint end */}

        <Button
          isNativeBase
          isDisabled={isCreating || !isReady}
          isLoading={isCreating}
          text="Create Password"
          onPress={handleCreate}
          style={{
            width: '100%',
            marginVertical: 20
          }}
        />

        <Text style={{ textAlign: 'center', fontSize: 12 }}>
          Lưu ý: CyStack không thể xem, không thể lưu trữ, cũng như không thể cấp lại Master Password trong trường hợp bạn quên hoặc đánh mất.
        </Text>
      </View>
    </Layout>
  )
})
