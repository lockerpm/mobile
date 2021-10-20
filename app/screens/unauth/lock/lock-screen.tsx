import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Alert, View } from "react-native"
import { AutoImage as Image, Button, Layout, Text, FloatingInput } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { color, commonStyles, fontSize } from "../../../theme"
import { useMixins } from "../../../services/mixins"
import { APP_ICON } from "../../../common/mappings"
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'


export const LockScreen = observer(function LockScreen() {
  const navigation = useNavigation()
  const { logout, sessionLogin, notify, biometricLogin, translate, notifyApiError } = useMixins()
  const { user } = useStores()

  // Params
  
  const [masterPassword, setMasterPassword] = useState('')
  const [isScreenLoading, setIsScreenLoading] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isBioUnlocking, setIsBioUnlocking] = useState(false)
  const [isSendingHint, setIsSendingHint] = useState(false)
  const [isError, setIsError] = useState(false)

  // Methods

  const handleLogout = async () => {
    setIsScreenLoading(true)
    await logout()
    setIsScreenLoading(false)
    navigation.navigate('onBoarding')
  }

  const handleUnlock = async () => {
    if (masterPassword) {
      setIsError(false)
      setIsUnlocking(true)
      const res = await sessionLogin(masterPassword)
      setIsUnlocking(false)
      if (res.kind === 'ok') {
        setMasterPassword('')
        navigation.navigate('mainStack', { screen: 'start' })
      } else if (res.kind === 'unauthorized') {
        navigation.navigate('login')
      } else {
        setIsError(true)
      }
    } else {
      setIsError(true)
    }
  }

  const handleUnlockBiometric = async () => {
    if (!user.isBiometricUnlock) {
      notify('error', translate('error.biometric_not_enable'))
      return
    }

    setIsBioUnlocking(true)
    const res = await biometricLogin()
    setIsBioUnlocking(false)
    if (res.kind === 'ok') {
      setMasterPassword('')
      navigation.navigate('mainStack', { screen: 'start' })
    }
  }

  const handleGetHint = async () => {
    setIsSendingHint(true)
    const res = await user.sendPasswordHint(user.email)
    setIsSendingHint(false)
    if (res.kind === 'ok') {
      notify('success', translate('lock.hint_sent'), 5000)
    } else {
      notifyApiError(res)
    }
  }

  // Components

  const header = (
    <View style={{ alignItems: "flex-end" }}>
      <Button
        text={translate('common.logout').toUpperCase()}
        textStyle={{ fontSize: fontSize.p }}
        preset="link"
        onPress={handleLogout}
      >
      </Button>
    </View>
  )

  const footer = (
    <Button
      isLoading={isSendingHint}
      isDisabled={isSendingHint}
      preset="link"
      text={translate("lock.get_hint")}
      onPress={handleGetHint}
      style={{
        width: '100%'
      }}
    />
  )

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
      header={header}
      footer={footer}
    >
      <View style={{ alignItems: 'center', paddingTop: '10%' }}>
        <Image source={APP_ICON.iconDark} style={{ height: 63, width: 63 }} />

        <Text
          preset="header"
          style={{ marginBottom: 10, marginTop: 25 }}
          tx={"lock.title"}
        />

        <Text
          style={{ textAlign: 'center' }}
          tx={"lock.desc"}
        />

        {/* Current user */}
        <View
          style={{
            marginTop: 16,
            marginBottom: 16,
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
          onChangeText={setMasterPassword}
          value={masterPassword}
          style={{ width: '100%' }}
          onSubmitEditing={handleUnlock}
        />
        {/* Master pass input end */}

        <Button
          isLoading={isUnlocking}
          isDisabled={isUnlocking || !masterPassword}
          text={translate("common.unlock")}
          onPress={handleUnlock}
          style={{
            width: '100%',
            marginTop: 20
          }}
        />

        {
          user.isBiometricUnlock && (
            <Button
              isLoading={isBioUnlocking}
              isDisabled={isBioUnlocking}
              preset="ghost"
              onPress={handleUnlockBiometric}
              style={{
                width: '100%',
                marginVertical: 10
              }}
            >
              <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { marginHorizontal: 5 }]}>
                <MaterialCommunityIconsIcon
                  name="face-recognition"
                  size={20}
                  color={color.textBlack}
                />
                <Text
                  preset="black"
                  text={translate("common.biometric_unlocking")}
                  style={{ marginLeft: 7 }}
                />
              </View>
            </Button>
          )
        }
      </View>
    </Layout>
  )
})
