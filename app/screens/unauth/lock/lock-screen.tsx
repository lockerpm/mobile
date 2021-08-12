import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { AutoImage as Image, Button, Layout, Text, FloatingInput } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { color } from "../../../theme"
import { useMixins } from "../../../services/mixins"

export const LockScreen = observer(function LockScreen() {
  const navigation = useNavigation()
  const { logout, sessionLogin, notify } = useMixins()
  const { user } = useStores()

  // Params
  const [masterPassword, setMasterPassword] = useState('')
  const [isScreenLoading, setIsScreenLoading] = useState(false)
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
      setIsScreenLoading(true)
      const res = await sessionLogin(masterPassword)
      setIsScreenLoading(false)
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

  const handleUnlockBiometric = () => {}

  const handleGetHint = () => {}

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
