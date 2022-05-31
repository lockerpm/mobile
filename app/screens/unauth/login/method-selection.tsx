import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import {Text, Button, RecaptchaChecker } from "../../../components"
import { useMixins } from "../../../services/mixins"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { commonStyles, spacing } from "../../../theme"
import { useStores } from "../../../models"


type Props = {
  methods: {
    type: string,
    data: any
  }[]
  onSelect: (type: string, data: any) => void
  goBack: () => void
  username: string,
  password: string
}


export const MethodSelection = observer((props: Props) => {
  const { user } = useStores()
  const { translate, notifyApiError, color } = useMixins()
  const { methods, onSelect, goBack, username, password } = props

  // ------------------ Params -----------------------

  const [sendingEmail, setIsSendingEmail] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState('')

  // ------------------ Methods ----------------------

  const sendEmail = async (data: any) => {
    setIsSendingEmail(true)
    const res = await user.sendOtpEmail(username, password, recaptchaToken)
    setIsSendingEmail(false)
    if (res.kind === 'ok') {
      onSelect('mail', data)
    } else {
      notifyApiError(res)
    }
  }

  // ------------------------------ RENDER -------------------------------

  const renderOptionContent = (title: string, icon: string, iconSize: number) => (
    <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
      <FontAwesomeIcon
        name={icon}
        size={iconSize}
        color={color.primary}
      />
      <Text style={{
        color: color.primary,
        marginLeft: spacing.margin / 2
      }}>
        {title}
      </Text>
    </View>
  )

  return (
    <View>
      <RecaptchaChecker
        onTokenLoad={setRecaptchaToken}
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
        text={translate('login.select_method')}
        style={{ marginBottom: spacing.margin }}
      />

      {
        methods.map((item, index) => (
          <Button
            key={index}
            preset="outline"
            isDisabled={item.type === 'mail' && sendingEmail}
            isLoading={item.type === 'mail' && sendingEmail}
            onPress={() => item.type === 'mail' ? sendEmail(item.data) : onSelect(item.type, item.data)}
            style={{
              width: '100%',
              marginBottom: spacing.margin / 2
            }}
          >
            {
              item.type === 'mail' && renderOptionContent(`Email ${item.data}`, 'envelope-o', 18)
            }
            {
              item.type === 'smart_otp' && renderOptionContent(translate('common.authentication_app'), 'mobile-phone', 24)
            }
          </Button>
        ))
      }
    </View>
  )
})
