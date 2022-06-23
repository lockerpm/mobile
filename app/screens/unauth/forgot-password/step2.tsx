import React, { useCallback, useRef, useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import {Text, Button, RecaptchaChecker } from "../../../components"
import { useMixins } from "../../../services/mixins"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { commonStyles } from "../../../theme"
import { useStores } from "../../../models"


type Props = {
  methods: {
    type: string,
    data: any
  }[]
  onSelect: (type: string, data: any) => void
  goBack: () => void
}


export const Step2 = observer((props: Props) => {
  const { user, uiStore } = useStores()
  const { translate, notifyApiError, color } = useMixins()
  const { methods, onSelect, goBack } = props

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
      <RecaptchaChecker
        ref={captchaRef}
      />

      <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        marginBottom: 30
      }]}>
        <Button
          preset="link"
          onPress={() => goBack()}
          style={{ marginRight: 15 }}
        >
          <IoniconsIcon 
            name="md-arrow-back"
            size={26} 
            color={color.title} 
          />
        </Button>
        <Text
          preset="header"
          text={translate('login.verify_your_identity')}
        />
      </View>

      <Text
        preset="black"
        text={translate('forgot_password.select_method')}
        style={{ marginBottom: 20 }}
      />

      {
        methods.map((item, index) => (
          <Button
            key={index}
            preset="outline"
            isDisabled={item.type === 'mail' && sendingEmail}
            isLoading={item.type === 'mail' && sendingEmail}
            onPress={
              () => item.type === 'mail' 
                ? getCaptchaToken().then(token => sendEmail(item.data, token))
                : onSelect(item.type, item.data)
            }
            style={{
              width: '100%',
              marginBottom: 15
            }}
          >
            {
              item.type === 'mail' && (
                <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { marginHorizontal: 5 }]}>
                  <FontAwesomeIcon
                    name="envelope-o"
                    size={18}
                    color={color.primary}
                  />
                  <Text style={{
                    color: color.primary,
                    marginLeft: 10
                  }}>
                    Email {item.data[0]}
                  </Text>
                </View>
              )
            }
            {
              item.type === 'smart_otp' && (
                <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
                  <FontAwesomeIcon
                    name="mobile-phone"
                    size={24}
                    color={color.primary}
                  />
                  <Text style={{
                    color: color.primary,
                    marginLeft: 10
                  }}>
                    {translate('common.authentication_app')}
                  </Text>
                </View>
              )
            }
          </Button>
        ))
      }
    </View>
  )
})
