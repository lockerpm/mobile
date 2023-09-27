/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Dimensions, ScrollView } from 'react-native'
import { Screen } from 'app/components/cores'
import { useStores } from 'app/models'
import { BusinessPasswordlessQrScan } from './PasswordlessQrScan'
import { useAuthentication } from 'app/services/hook'
import { useCoreService } from 'app/services/coreService'
import { BiometricsType } from '../lock.types'

import { OtpPasswordlessGenerator, randomOtpNumber } from '../onPremise/passwordless/OtpGenerator'

const { width } = Dimensions.get('screen')

interface Props {
  biometryType: BiometricsType
  handleLogout: () => void
}

export const BusinessLockByPasswordless = ({ handleLogout }: Props) => {
  const navigation = useNavigation()
  const { user } = useStores()
  const { biometricLogin } = useAuthentication()
  const { cryptoService } = useCoreService()

  // ---------------------- PARAMS -------------------------
  const [otp, setOtp] = useState(randomOtpNumber())
  const [scanQrStep, setScanQrStep] = useState(0)

  const scrollViewRef = useRef(null)
  // ------------------ METHODS ---------------------
  const scrollTo = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    })
    setScanQrStep(index)
  }

  const handleUnlockBiometric = async () => {
    const key = await cryptoService.getKey()
    if (!key) return

    const res = await biometricLogin()
    if (res.kind === 'ok') {
      navigation.navigate('mainStack', { screen: 'start' })
    }
  }

  // Auto trigger face id / touch id + detect biometry type
  useEffect(() => {
    navigation.addListener('focus', () => {
      if (user.isBiometricUnlock) {
        handleUnlockBiometric()
      }
    })
  }, [])

  return (
    <Screen safeAreaEdges={['top']}>
      <ScrollView
        horizontal
        pagingEnabled
        scrollEnabled={false}
        ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        scrollEventThrottle={16}
      >
        <OtpPasswordlessGenerator
          otp={otp}
          setOtp={setOtp}
          goNext={() => {
            scrollTo(1)
          }}
          goBack={() => {
            navigation.goBack()
          }}
        />
        <BusinessPasswordlessQrScan
          otp={otp}
          goBack={() => {
            scrollTo(0)
          }}
          index={scanQrStep}
        />
      </ScrollView>
    </Screen>
  )
}
