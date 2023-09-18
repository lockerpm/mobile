import React, { useState, useRef, useCallback } from 'react'
import { View } from 'react-native'
import { Text, Button, Icon } from 'app/components-v2/cores'
import { useStores } from 'app/models'
import { useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { translate } from 'app/i18n'
import { RecaptchaChecker } from 'app/components'

type Props = {
  methods: {
    type: string
    data: any
  }[]
  onSelect: (type: string, data: any) => void
}

export const MethodSelection = (props: Props) => {
  const { user, uiStore } = useStores()
  const { colors } = useTheme()
  const { notifyApiError } = useHelper()
  const { methods, onSelect } = props

  const captchaRef = useRef(null)

  // ------------------ Params -----------------------

  const [sendingEmail, setIsSendingEmail] = useState(false)

  // ------------------ Methods ----------------------

  const getCaptchaToken = useCallback(async () => {
    return await captchaRef.current.waitForToken()
  }, [])

  const sendEmail = async (data: any, captchaToken: string) => {
    if (uiStore.lockResendOtpResetPasswordTime) {
      onSelect('mail', data)
      return
    }

    setIsSendingEmail(true)
    const res = await user.resetPassword(data[0], 'mail', captchaToken)
    setIsSendingEmail(false)
    if (res.kind === 'ok') {
      uiStore.setLockResendOtpResetPasswordTime(Date.now() + 60 * 1000)
      onSelect('mail', data)
    } else {
      notifyApiError(res)
    }
  }

  // ------------------------------ RENDER -------------------------------

  return (
    <View>
      <RecaptchaChecker ref={captchaRef} />

      <Text
        preset="bold"
        size="xl"
        text={translate('login.verify_your_identity')}
        style={{
          marginBottom: 30,
          textAlign: 'center',
        }}
      />

      <Text text={translate('forgot_password.select_method')} style={{ marginBottom: 12 }} />

      {methods.map((item, index) => (
        <Button
          key={index}
          preset="secondary"
          disabled={item.type === 'mail' && sendingEmail}
          loading={item.type === 'mail' && sendingEmail}
          onPress={() =>
            item.type === 'mail'
              ? getCaptchaToken().then((token) => sendEmail(item.data, token))
              : onSelect(item.type, item.data)
          }
          style={{
            width: '100%',
            marginBottom: 12,
          }}
        >
          {item.type === 'mail' && (
            <View style={{ marginHorizontal: 5, flexDirection: 'row', alignItems: 'center' }}>
              <Icon icon={'envelope-simple'} size={20} color={colors.primary} />
              <Text
                style={{
                  color: colors.primary,
                  marginLeft: 10,
                }}
              >
                Email {item.data[0]}
              </Text>
            </View>
          )}
          {item.type === 'smart_otp' && (
            <View style={{ marginHorizontal: 5, flexDirection: 'row', alignItems: 'center' }}>
              <Icon icon={'device-mobile'} size={20} color={colors.primary} />
              <Text
                style={{
                  color: colors.primary,
                  marginLeft: 10,
                }}
              >
                {translate('common.authentication_app')}
              </Text>
            </View>
          )}
        </Button>
      ))}
    </View>
  )
}
