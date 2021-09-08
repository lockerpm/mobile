import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { AutoImage as Image, Button, Layout, Text, FloatingInput, PasswordStrength } from "../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { useStores } from "../../../models"
import { color } from "../../../theme"
import { useMixins } from "../../../services/mixins"
import { RootParamList } from "../../../navigators"
import { translate } from "../../../i18n/translate"

type ScreenProp = RouteProp<RootParamList, 'createMasterPassword'>;

export const CreateMasterPasswordScreen = observer(function CreateMasterPasswordScreen() {
  const navigation = useNavigation()
  const route = useRoute<ScreenProp>()
  const { logout, register } = useMixins()
  const { user, uiStore } = useStores()
  const { getPasswordStrength } = useMixins()

  // Params
  const [masterPassword, setMasterPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [hint, setHint] = useState('')

  // UI
  const [passwordStrength, setPasswordStrength] = useState(-1)
  const [isScreenLoading, setIsScreenLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const isError = !!masterPassword && !!confirmPassword && (masterPassword !== confirmPassword)
  const isReady = !isError && !!masterPassword && !!confirmPassword

  // Methods
  const mounted = async () => {
    if (!route.params || !route.params.skipCheck) {
      if (!uiStore.isOffline) {
        await user.getUser()
      }
    }
    setIsScreenLoading(false)
  }

  const handleLogout = async () => {
    setIsScreenLoading(true)
    await logout()
    setIsScreenLoading(false)
    navigation.navigate('onBoarding')
  }

  const handleCreate = async () => {
    setIsCreating(true)
    const res = await register(masterPassword, hint, passwordStrength)
    setIsCreating(false)
    if (res.kind === 'ok') {
      navigation.navigate('lock')
    }
  }

  // Mounted
  useEffect(() => {
    // setTimeout(mounted, 100)
    mounted()
  }, [])

  // Render
  return (
    <Layout
      isOverlayLoading={isScreenLoading}
      header={(
        <View style={{ alignItems: "flex-end" }}>
          <Button
            text={translate('common.logout')}
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
          tx="create_master_pass.title"
        />

        <Text
          style={{ textAlign: 'center', fontSize: 12 }}
          tx="create_master_pass.desc"
        />

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
          {
            !!user.avatar && (
              <Image
                source={{ uri: user.avatar }}
                style={{
                  height: 28,
                  width: 28,
                  borderRadius: 14,
                  backgroundColor: color.palette.white
                }}
              />
            )
          }
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
          label={translate('common.master_pass')}
          onChangeText={(text) => {
            setMasterPassword(text)
            const strength = getPasswordStrength(text)
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
          label={translate('create_master_pass.confirm_master_pass')}
          onChangeText={setConfirmPassword}
          value={confirmPassword}
          style={{ width: '100%', marginVertical: 20 }}
        />
        {/* Master pass confirm end */}

        {/* Hint */}
        <FloatingInput
          label={translate('create_master_pass.hint')}
          onChangeText={setHint}
          value={hint}
          style={{ width: '100%', marginBottom: 20 }}
        />
        {/* Hint end */}

        <Button
          isNativeBase
          isDisabled={isCreating || !isReady}
          isLoading={isCreating}
          text={translate('create_master_pass.btn')}
          onPress={handleCreate}
          style={{
            width: '100%',
            marginVertical: 20
          }}
        />

        <Text
          style={{ textAlign: 'center', fontSize: 12 }}
          tx="create_master_pass.note"
        />
      </View>
    </Layout>
  )
})
