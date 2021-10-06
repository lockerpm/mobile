import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import {Text, Button } from "../../../components"
import { useMixins } from "../../../services/mixins"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { color, commonStyles } from "../../../theme"
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


export const MethodSelection = observer(function MethodSelection(props: Props) {
  const { user } = useStores()
  const { translate, notify } = useMixins()
  const { methods, onSelect, goBack, username, password } = props

  // ------------------ Params -----------------------

  const [sendingEmail, setIsSendingEmail] = useState(false)

  // ------------------ Methods ----------------------

  const sendEmail = async (data: any) => {
    setIsSendingEmail(true)
    const res = await user.sendOtpEmail(username, password)
    setIsSendingEmail(false)
    if (res.kind === 'ok' && res.success) {
      onSelect('mail', data)
    } else {
      notify('error', translate('error.something_went_wrong'))
    }
  }

  // ------------------------------ RENDER -------------------------------

  return (
    <View>
      <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        marginBottom: 20
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
              marginBottom: 15
            }}
          >
            {
              item.type === 'mail' && (
                <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { marginHorizontal: 5 }]}>
                  <FontAwesomeIcon
                    name="envelope-o"
                    size={18}
                    color={color.palette.green}
                  />
                  <Text style={{
                    color: color.palette.green,
                    marginLeft: 10
                  }}>
                    Email {item.data}
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
                    color={color.palette.green}
                  />
                  <Text style={{
                    color: color.palette.green,
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
