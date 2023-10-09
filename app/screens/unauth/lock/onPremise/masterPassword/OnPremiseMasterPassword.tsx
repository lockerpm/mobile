import React, { useEffect, useState } from 'react'
import { BackHandler, View, Image, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useStores } from 'app/models'
import { useCoreService } from 'app/services/coreService'
import { OnPremisePreloginData } from 'app/static/types'
import { BiometricsType } from '../../lock.types'
import { useAuthentication, useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { Logo, Button, Screen, Text, TextInput, Icon } from 'app/components/cores'
import { translate } from 'app/i18n'

interface Props {
  data: OnPremisePreloginData
  email: string
  biometryType: BiometricsType
  handleLogout: () => void
}

export const OnPremiseLockMasterPassword = ({ data, email, biometryType, handleLogout }: Props) => {
  const navigation = useNavigation() as any
  const { user, uiStore } = useStores()
  const { colors } = useTheme()
  const { notify } = useHelper()
  const { sessionLogin, biometricLogin } = useAuthentication()
  const { cryptoService } = useCoreService()

  // ---------------------- PARAMS -------------------------

  const [isValidForBiometric, setIsValidForBiometric] = useState(false)
  const [masterPassword, setMasterPassword] = useState('')

  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isBioUnlocking, setIsBioUnlocking] = useState(false)
  const [isError, setIsError] = useState(false)

  // ---------------------- METHODS -------------------------

  const isAutofillAnroid =
    uiStore.isFromAutoFill || uiStore.isOnSaveLogin || uiStore.isFromAutoFillItem

  // ---------------------- METHODS -------------------------
  const checkKey = async () => {
    // Online login
    const key = await cryptoService.getKey()
    if (!key) {
      setIsValidForBiometric(false)
      return false
    } else {
      setIsValidForBiometric(true)
      return true
    }
  }
  const handleUnlock = async () => {
    if (masterPassword) {
      setIsError(false)
      setIsUnlocking(true)
      const res = await sessionLogin(masterPassword, () => null, true)
      setIsUnlocking(false)

      if (res.kind === 'ok') {
        setMasterPassword('')
        navigation.navigate('mainStack', { screen: 'start' })
      } else if (res.kind === 'unauthorized') {
        navigation.navigate('login', { type: 'onPremise' })
      } else if (res.kind === 'on-premise-2fa') {
        //
      } else {
        setIsError(true)
      }
    } else {
      setIsError(true)
    }
  }

  const handleUnlockBiometric = async () => {
    const hadKey = await checkKey()
    if (!hadKey) return

    setIsBioUnlocking(true)
    const res = await biometricLogin()
    setIsBioUnlocking(false)
    if (res.kind === 'ok') {
      setMasterPassword('')
      navigation.navigate('mainStack', { screen: 'start' })
    }
  }

  // -------------- EFFECT ------------------

  // Auto trigger face id / touch id + detect biometry type
  useEffect(() => {
    checkKey()
    navigation.addListener('focus', () => {
      if (user.isBiometricUnlock) {
        handleUnlockBiometric()
      }
    })
  }, [])

  // ---------------------- RENDER -------------------------
  return (
    <Screen>
      <View style={{ flex: 1 }}>
        <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
          {isAutofillAnroid ? (
            <Text
              preset="bold"
              text={translate('common.cancel').toUpperCase()}
              onPress={() => BackHandler.exitApp()}
              color={colors.primary}
            />
          ) : (
            <Text
              preset="bold"
              text={translate('common.logout').toUpperCase()}
              onPress={handleLogout}
              color={colors.primary}
            />
          )}
        </View>
        <View style={{ alignItems: 'center', paddingTop: '10%' }}>
          <Logo preset="default" style={{ height: 73, width: 63 }} />

          <Text
            preset="bold"
            size="xl"
            style={{ marginBottom: 10, marginTop: 25 }}
            tx={'lock.title'}
          />

          <Text style={{ textAlign: 'center' }} tx={'lock.desc'} />

          {/* Current user */}
          <View
            style={{
              marginTop: 16,
              marginBottom: 16,
              borderRadius: 20,
              backgroundColor: colors.block,
              flexDirection: 'row',
              alignItems: 'center',
              padding: 4,
            }}
          >
            {!!data?.avatar && (
              <View style={{ borderRadius: 14, overflow: 'hidden' }}>
                <Image
                  source={{ uri: data.avatar }}
                  style={{
                    height: 28,
                    width: 28,
                    backgroundColor: colors.background,
                  }}
                />
              </View>
            )}
            <Text
              size="base"
              style={{
                marginHorizontal: 10,
              }}
            >
              {user.email || email}
            </Text>
          </View>
          {/* Current user end */}

          {/* Master pass input */}
          <TextInput
            isPassword
            animated
            isError={isError}
            label={translate('common.master_pass')}
            onChangeText={setMasterPassword}
            value={masterPassword}
            onSubmitEditing={handleUnlock}
          />
          {/* Master pass input end */}

          <Button
            loading={isUnlocking}
            disabled={isUnlocking || !masterPassword}
            text={translate('common.unlock')}
            onPress={handleUnlock}
            style={{
              marginTop: 20,
            }}
          />

          <TouchableOpacity
            disabled={isBioUnlocking}
            onPress={() => {
              if (!user.isBiometricUnlock) {
                notify('error', translate('error.biometric_not_enable'))
                return
              }
              if (!isValidForBiometric) {
                notify('info', translate('error.not_valid_for_biometric'))
                return
              }
              handleUnlockBiometric()
            }}
            style={{
              width: '100%',
              marginVertical: 25,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Icon icon={biometryType === BiometricsType.FaceID ? 'face-id' : 'fingerprint'} />
              <Text
                // @ts-ignore
                text={translate(`common.${biometryType}_unlocking`)}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  )
}
