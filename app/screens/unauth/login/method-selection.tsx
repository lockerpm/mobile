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
  const { translate, notifyApiError } = useMixins()
  const { methods, onSelect, goBack, username, password } = props

  // ------------------ Params -----------------------

  const [sendingEmail, setIsSendingEmail] = useState(false)

  // ------------------ Methods ----------------------

  const sendEmail = async (data: any) => {
    setIsSendingEmail(true)
    const res = await user.sendOtpEmail(username, password)
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
        color={color.textBlack}
      />
      <Text style={{
        color: color.textBlack,
        marginLeft: 10
      }}>
        {title}
      </Text>
    </View>
  )

  return (
    <View>
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

      {
        methods.map((item, index) => (
          <Button
            key={index}
            preset="outlinePlain"
            isDisabled={item.type === 'mail' && sendingEmail}
            isLoading={item.type === 'mail' && sendingEmail}
            onPress={() => item.type === 'mail' ? sendEmail(item.data) : onSelect(item.type, item.data)}
            style={{
              width: '100%',
              marginBottom: 15
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
