import React, { useEffect, useRef, useState } from 'react'
import { View, useWindowDimensions, ScrollView } from 'react-native'
import { Button, ImageIcon, Logo, Text } from 'app/components-v2/cores'
import { useTheme } from 'app/services/context'
import { translate } from 'app/i18n'

const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const indices = [0, 1, 2, 3, 4, 5]

interface Props {
  otp: number
  setOtp: (val: number) => void
  goNext: () => void
  goBack: () => void
}

const OTP_EXPIRED_COUNTER = 60

export const OtpPasswordlessGenerator = ({ otp, setOtp, goNext, goBack }: Props) => {
  const { colors, isDark } = useTheme()

  const [expireOtpCounter, setExpireOtpCounter] = useState(OTP_EXPIRED_COUNTER)
  const timerRef = React.useRef(expireOtpCounter)

  const { width } = useWindowDimensions()

  const reGenOtp = () => {
    setOtp(randomOtpNumber())
    setExpireOtpCounter(OTP_EXPIRED_COUNTER)
    timerRef.current = OTP_EXPIRED_COUNTER
  }

  const counter = () => {
    if (timerRef.current === 0) {
      reGenOtp()
    }
    timerRef.current -= 1
    setExpireOtpCounter(timerRef.current)
  }

  useEffect(() => {
    const timerId = setInterval(() => {
      counter()
    }, 1000)
    return () => {
      clearInterval(timerId)
    }
  }, [])

  return (
    <ScrollView style={{ width, padding: 20, paddingTop: 50 }}>
      <Logo
        preset={isDark ? 'horizontal-light' : 'horizontal-dark'}
        style={{ width: 132, height: 41, alignSelf: 'center', marginBottom: 20 }}
        resizeMode="contain"
      />

      <Text text={translate('onpremise_passwordless.title')} style={{ marginBottom: 32 }} />

      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <NumberDisplay number={otp} width={width} />
      </View>

      <Text
        text={translate('onpremise_passwordless.expired', { ss: expireOtpCounter })}
        style={{ color: colors.error, textAlign: 'center' }}
      />

      <Button
        preset="teriatary"
        onPress={() => {
          reGenOtp()
        }}
        size="large"
        text={translate('onpremise_passwordless.new_otp')}
        style={{ marginBottom: 8 }}
      />

      <View
        style={{
          width: '100%',
          padding: 20,
          backgroundColor: colors.block,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        {/* <Text preset="label" text={translate("onpremise_passwordless.instruction")} style={{ marginBottom: 16 }} /> */}
        <Instruction
          step="01."
          icon="app-logo"
          text={translate('onpremise_passwordless.instruction.1')}
        />
        <Instruction
          step="02."
          icon="avatar"
          text={translate('onpremise_passwordless.instruction.2')}
        />
        <Instruction
          step="03."
          icon="key-hole"
          text={translate('onpremise_passwordless.instruction.3')}
        />
        <Instruction
          step="04."
          icon="number-square-one"
          text={translate('onpremise_passwordless.instruction.4')}
        />
      </View>

      <Button
        onPress={goNext}
        size="large"
        text={translate('common.continue')}
        style={{ marginBottom: 16 }}
      />

      <Button
        onPress={goBack}
        size="large"
        text={translate('onpremise_passwordless.instruction.go_back')}
        style={{ marginBottom: 16, backgroundColor: colors.block }}
        textStyle={{ color: colors.primaryText }}
      />
      <View style={{ height: 120 }} />
    </ScrollView>
  )
}

export const randomOtpNumber = () => {
  return Math.round(Math.random() * 1000000)
}

const Instruction = ({
  step,
  icon,
  text,
}: {
  step: string
  icon: 'avatar' | 'app-logo' | 'key-hole' | 'number-square-one'
  text: string
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      <Text text={step} />
      <ImageIcon icon={icon} size={32} style={{ marginHorizontal: 12 }} />
      <Text
        text={text}
        style={{
          maxWidth: '75%',
        }}
      />
    </View>
  )
}

function getDigit(number: number, i: number) {
  return parseInt(number.toString().charAt(i))
}

function NumberDisplay({ number, width }: { number: number; width: number }) {
  return (
    <View style={{ width: width, height: 50, paddingHorizontal: 20 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {indices.map((i) => {
          return <Digit digit={getDigit(number, i)} key={i} />
        })}
      </View>
    </View>
  )
}

function Digit({ digit }: { digit: number }) {
  const aref = useRef<ScrollView>()
  const { colors } = useTheme()
  useEffect(() => {
    aref.current.scrollTo({ x: 5, y: digit * 50, animated: true })
  }, [digit])

  return (
    <View style={{ height: 50, width: 40, borderBottomWidth: 2, borderBottomColor: colors.border }}>
      <ScrollView ref={aref}>
        {digits.map((i) => {
          return (
            <View
              style={{
                height: 50,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
              key={i}
            >
              <Text style={{ fontSize: 24, fontWeight: '600' }}>{i}</Text>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}