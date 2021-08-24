import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { AutoImage as Image, Button, Layout, Text, FloatingInput } from "../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { useStores } from "../../../models"
import { color } from "../../../theme"
import { useMixins } from "../../../services/mixins"
import { RootParamList } from "../../../navigators/root-navigator"

type ScreenProp = RouteProp<RootParamList, 'lock'>;

export const LockScreen = observer(function LockScreen() {
  const navigation = useNavigation()
  const route = useRoute<ScreenProp>()
  const { logout, sessionLogin, notify } = useMixins()
  const { user } = useStores()

  // Params
  const [masterPassword, setMasterPassword] = useState('')
  const [isScreenLoading, setIsScreenLoading] = useState(true)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isSendingHint, setIsSendingHint] = useState(false)
  const [isError, setIsError] = useState(false)

  // Methods
  const mounted = async () => {
    if (!route.params || !route.params.skipCheck) {
      await user.getUser()
    }
    setIsScreenLoading(false)
  }

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
        navigation.navigate('mainStack')
      } else if (res.kind === 'unauthorized') {
        navigation.navigate('login')
      } else {
        setIsError(true)
      }
    } else {
      setIsError(true)
      notify('error', 'Missing data', 'Enter password pls')
    }
  }

  const handleUnlockBiometric = () => {
    navigation.navigate('mainStack')
  }

  const handleGetHint = async () => {
    setIsSendingHint(true)
    const res = await user.sendPasswordHint(user.email)
    setIsSendingHint(false)
    if (res.kind === 'ok') {
      notify('success', 'Master Password hint sent', 'Please check your email for instructions')
    } else {
      notify('error', 'Error', 'Something went wrong')
    }
  }

  // Components
  const header = (
    <View style={{ alignItems: "flex-end" }}>
      <Button
        text="LOG OUT"
        textStyle={{ fontSize: 12 }}
        preset="link"
        onPress={handleLogout}
      >
      </Button>
    </View>
  )

  // Mounted
  useEffect(() => {
    // setTimeout(mounted, 2000)
    mounted()
  }, [])

  // Render
  return (
    <Layout
      isOverlayLoading={isScreenLoading}
      header={header}
    >
      <View style={{ alignItems: 'center', paddingTop: '10%' }}>
        <Image source={require("./locker.png")} style={{ height: 63, width: 63 }} />

        <Text
          preset="header"
          style={{ marginBottom: 10, marginTop: 25 }}
        >
          Welcome Back!
        </Text>

        <Text style={{ textAlign: 'center' }}>
          Enter your Master Password to Log In
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
          onChangeText={setMasterPassword}
          value={masterPassword}
          style={{ width: '100%' }}
        />
        {/* Master pass input end */}

        <Button
          isNativeBase
          isLoading={isUnlocking}
          isDisabled={isUnlocking}
          text="Unlock"
          onPress={handleUnlock}
          style={{
            width: '100%',
            marginTop: 20
          }}
        />

        <Button
          isNativeBase
          variant="outline"
          text="Unlock using biometric"
          onPress={handleUnlockBiometric}
          style={{
            width: '100%',
            marginVertical: 10
          }}
        />

        <Button
          isNativeBase
          isLoading={isSendingHint}
          isDisabled={isSendingHint}
          variant="ghost"
          text="Get Master Password hint"
          onPress={handleGetHint}
          style={{
            width: '100%'
          }}
        />
      </View>
    </Layout>
  )
})
