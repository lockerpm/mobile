import React, { useEffect, useState } from 'react'
import { Alert, BackHandler, View, Image, TouchableOpacity } from 'react-native'
import { useAuthentication, useCipherData, useCipherHelper, useHelper } from 'app/services/hook'
import { useStores } from 'app/models'
import { EnterpriseInvitation } from 'app/static/types'
import { BiometricsType } from '../lock.types'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from 'app/services/context'
import { CipherView, LoginUriView, LoginView } from 'core/models/view'
import { CipherType } from 'core/enums'
import { useCoreService } from 'app/services/coreService'
import { Logo, Button, Screen, Text, TextInput, Header, Icon } from 'app/components/cores'
import { EnterpriseInvitationModal } from './EnterpriseInvitationModal'

interface Props {
  biometryType: BiometricsType
  handleLogout: () => void
}

export const LockByMasterPassword = ({ biometryType, handleLogout }: Props) => {
  const { colors } = useTheme()
  const navigation = useNavigation() as any
  const { user, uiStore, enterpriseStore } = useStores()
  const { notify, notifyApiError, translate } = useHelper()
  const { sessionLogin, biometricLogin } = useAuthentication()
  const { createCipher } = useCipherData()
  const { getPasswordStrength, newCipher } = useCipherHelper()

  const { cryptoService } = useCoreService()

  // ---------------------- PARAMS -------------------------

  const [isValidForBiometric, setIsValidForBiometric] = useState(false)
  const [masterPassword, setMasterPassword] = useState('demo@123')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isBioUnlocking, setIsBioUnlocking] = useState(false)
  const [isSendingHint, setIsSendingHint] = useState(false)
  const [isError, setIsError] = useState(false)

  // enterprise invitaion param
  const [isShowedInvitationPopup, setIsShowedInvitaionPopup] = useState(false)
  const [isShowInvitation, setIsShowInvitation] = useState(false)

  const [enterpeiseInvitations, setEnterpriseInvitations] = useState<EnterpriseInvitation[]>([])

  // ---------------------- METHODS -------------------------

  const isAutofillAnroid =
    uiStore.isFromAutoFill || uiStore.isOnSaveLogin || uiStore.isFromAutoFillItem

  const showInvitation = (() => {
    if (enterpeiseInvitations.length === 0) return false
    return enterpeiseInvitations.some((e) => e.domain !== null)
  })()

  // ---------------------- METHODS -------------------------
  // first check is crypto keyu exist
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

  // Prepare to save password
  const createMasterPasswordItem = async () => {
    const payload: CipherView = newCipher(CipherType.MasterPassword)

    const data = new LoginView()
    data.username = 'locker.io'
    data.password = masterPassword

    const uriView = new LoginUriView()
    uriView.uri = 'https://locker.io'
    data.uris = [uriView]

    payload.name = 'Locker Master Password'
    payload.login = data
    const pwStrength = getPasswordStrength(masterPassword)
    const res = await createCipher(payload, pwStrength.score, [], true)
    if (res.kind !== 'ok') {
      notify('error', translate('error.master_password'))
    }
  }

  const handleUnlock = async () => {
    if (showInvitation) {
      setIsShowInvitation(true)
      return
    }
    if (masterPassword) {
      setIsError(false)
      setIsUnlocking(true)
      const res = await sessionLogin(masterPassword, user.email, createMasterPasswordItem)
      setIsUnlocking(false)
      if (res.kind === 'ok') {
        setMasterPassword('')
        navigation.navigate('mainStack', { screen: 'start' })
      } else if (res.kind === 'unauthorized') {
        navigation.navigate('login', { type: 'individual' })
      } else if (res.kind === 'enterprise-lock') {
        Alert.alert('', translate('alert.enterprise_lock'), [
          {
            text: translate('common.ok'),
            style: 'cancel',
            onPress: () => null,
          },
        ])
      } else if (res.kind === 'enterprise-system-lock') {
        Alert.alert('', translate('alert.enterprise_system_lock'), [
          {
            text: translate('common.ok'),
            style: 'cancel',
            onPress: () => null,
          },
        ])
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

    if (showInvitation) {
      setIsShowInvitation(true)
      return
    }
    setIsBioUnlocking(true)
    const res = await biometricLogin(user.email)
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

  const fetchEnterpriseInvitation = async () => {
    const res = await enterpriseStore.invitations()
    setEnterpriseInvitations(res)
  }

  // -------------- EFFECT ------------------

  // enterprise invitations
  useEffect(() => {
    if (isShowedInvitationPopup) {
      fetchEnterpriseInvitation()
      setIsShowedInvitaionPopup(false)
    }
  }, [isShowedInvitationPopup])

  useEffect(() => {
    checkKey()
    fetchEnterpriseInvitation()
  }, [])

  useEffect(() => {
    navigation.addListener('focus', () => {
      if (user.isBiometricUnlock) {
        handleUnlockBiometric()
      }
    })
  }, [])

  // ---------------------- RENDER -------------------------
  return (
    <Screen
      preset="auto"
      padding
      safeAreaEdges={['bottom']}
      header={
        <Header
          RightActionComponent={
            isAutofillAnroid ? (
              <Text
                preset="bold"
                color={colors.primary}
                text={translate('common.cancel').toUpperCase()}
                onPress={() => BackHandler.exitApp()}
                style={{ paddingHorizontal: 20 }}
              />
            ) : (
              <Text
                text={translate('common.logout').toUpperCase()}
                preset="bold"
                color={colors.primary}
                onPress={handleLogout}
                style={{ paddingHorizontal: 20 }}
              />
            )
          }
        />
      }
      contentContainerStyle={{
        flex: 1,
        justifyContent: 'space-between',
      }}
    >
      <EnterpriseInvitationModal
        isOpen={isShowInvitation}
        enterpeiseInvitations={enterpeiseInvitations}
        onClose={() => {
          setIsShowedInvitaionPopup(true)
          setIsShowInvitation(false)
        }}
      />

      <View>
        <Logo
          preset={'default'}
          style={{ height: 80, width: 70, marginBottom: 25, alignSelf: 'center' }}
        />

        <Text
          preset="bold"
          size="xl"
          style={{ marginBottom: 10, textAlign: 'center' }}
          tx={'lock.title'}
        />

        <Text style={{ textAlign: 'center' }} tx={'lock.desc'} />

        {/* Current user */}
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              marginVertical: 16,
              borderRadius: 20,
              backgroundColor: colors.block,
              flexDirection: 'row',
              alignItems: 'center',
              padding: 4,
            }}
          >
            {!!user.avatar && (
              <Image
                source={{ uri: user.avatar }}
                style={{
                  height: 28,
                  width: 28,
                  borderRadius: 14,
                  backgroundColor: colors.white,
                }}
              />
            )}

            <Text
              size="base"
              text={user.email}
              style={{
                marginHorizontal: 10,
              }}
            />
          </View>
        </View>

        <TextInput
          isPassword
          animated
          isError={isError}
          label={translate('common.master_pass')}
          onChangeText={setMasterPassword}
          value={masterPassword}
          onSubmitEditing={handleUnlock}
        />

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
      <Button
        preset="teriatary"
        disabled={isSendingHint}
        text={translate('lock.get_hint')}
        onPress={handleGetHint}
      />
    </Screen>
  )
}
