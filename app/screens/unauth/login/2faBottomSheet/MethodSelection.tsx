import React, { useState, useRef, useCallback } from 'react'
import { View } from 'react-native'
import { Text, Button, Icon } from 'app/components/cores'
import { useStores } from 'app/models'
import { useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { translate } from 'app/i18n'
import { RecaptchaChecker } from 'app/components/utils'

type Props = {
  methods: {
    type: string
    data: any
  }[]
  onSelect: (type: string, data: any) => void
  username: string
  password: string
}

export const MethodSelection = (props: Props) => {
  const { user } = useStores()
  const { colors } = useTheme()
  const { notifyApiError } = useHelper()
  const { methods, onSelect, username, password } = props

  const captchaRef = useRef(null)

  // ------------------ Params -----------------------

  const [sendingEmail, setIsSendingEmail] = useState(false)

  // ------------------ Methods ----------------------

  const getCaptchaToken = useCallback(async () => {
    return await captchaRef.current.waitForToken()
  }, [])

  const sendEmail = async (data: any, captchaToken: string) => {
    setIsSendingEmail(true)
    const res = await user.sendOtpEmail(username, password, captchaToken)
    setIsSendingEmail(false)
    if (res.kind === 'ok') {
      onSelect('mail', data)
    } else {
      notifyApiError(res)
    }
  }

  // ------------------------------ RENDER -------------------------------

  const renderOptionContent = (
    title: string,
    icon: 'envelope-simple' | 'device-mobile',
    iconSize: number
  ) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Icon icon={icon} size={iconSize} color={colors.primary} />
      <Text
        style={{
          color: colors.primary,
          marginLeft: 12,
        }}
      >
        {title}
      </Text>
    </View>
  )

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

      <Text text={translate('login.select_method')} style={{ marginBottom: 12 }} />

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
          {item.type === 'mail' && renderOptionContent(`Email ${item.data}`, 'envelope-simple', 18)}
          {item.type === 'smart_otp' &&
            renderOptionContent(translate('common.authentication_app'), 'device-mobile', 24)}
        </Button>
      ))}
    </View>
  )
}
