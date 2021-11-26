import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Alert, View } from "react-native"
import { AutoImage as Image, Button, Layout, Text, FloatingInput, PasswordStrength } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { color as colorLight, colorDark, fontSize } from "../../../theme"
import { useMixins } from "../../../services/mixins"
import { APP_ICON } from "../../../common/mappings"


export const CreateMasterPasswordScreen = observer(function CreateMasterPasswordScreen() {
  const navigation = useNavigation()
  const { logout, registerLocker, translate, sessionLogin } = useMixins()
  const { user, uiStore } = useStores()
  const { getPasswordStrength } = useMixins()
  const color = uiStore.isDark ? colorDark : colorLight

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

  const handleCreate = async () => {
    setIsCreating(true)
    const res = await registerLocker(masterPassword, hint, passwordStrength)
    if (res.kind === 'ok') {
      const sessionRes = await sessionLogin(masterPassword)
      setIsCreating(false)
      if (sessionRes.kind === 'ok') {
        navigation.navigate('mainStack')
      } else {
        navigation.navigate('lock')
      }
    } else {
      setIsCreating(false)
    }
  }

  // -------------- EFFECT ------------------

  useEffect(() => {
    const handleBack = (e) => {
      if (!['POP', 'GO_BACK'].includes(e.data.action.type)) {
        navigation.dispatch(e.data.action)
        return
      }

      e.preventDefault()

      Alert.alert(
        translate('alert.logout') + user.email + '?',
        '',
        [
          { 
            text: translate('common.cancel'), 
            style: 'cancel', 
            onPress: () => {}
          },
          {
            text: translate('common.logout'),
            style: 'destructive',
            onPress: async () => {
              await logout()
              navigation.navigate('onBoarding')
            }
          },
        ]
      )
    }

    navigation.addListener('beforeRemove', handleBack)

    return () => {
      navigation.removeListener('beforeRemove', handleBack)
    }
  }, [navigation])

  // Render
  return (
    <Layout
      isOverlayLoading={isScreenLoading}
      header={(
        <View style={{ alignItems: "flex-end" }}>
          <Button
            text={translate('common.logout').toUpperCase()}
            textStyle={{ fontSize: fontSize.p }}
            preset="link"
            onPress={handleLogout}
          >
          </Button>
        </View>
      )}
    >
      <View style={{ alignItems: 'center' }}>
        <Image source={APP_ICON.iconDark} style={{ height: 63, width: 63 }} />

        <Text
          preset="header"
          style={{ marginBottom: 10, marginTop: 25 }}
          text={translate("create_master_pass.title")}
        />

        <Text
          style={{ textAlign: 'center', fontSize: fontSize.small, lineHeight: 21 }}
          text={translate("create_master_pass.desc")}
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
                  backgroundColor: color.white
                }}
              />
            )
          }
          <Text
            style={{
              fontSize: fontSize.small,
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
          style={{ textAlign: 'center', fontSize: fontSize.small, lineHeight: 21 }}
          text={translate("create_master_pass.note")}
        />
      </View>
    </Layout>
  )
})
