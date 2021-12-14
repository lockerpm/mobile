import React from "react"
import { observer } from "mobx-react-lite"
import { Linking, View } from "react-native"
import { Layout, Text, Button, Header } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles } from "../../../../theme"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { useMixins } from "../../../../services/mixins"
import { PRIVACY_POLICY_URL, TERMS_URL } from "../../../../config/constants"


type Item = {
  name: string
  disabled?: boolean
  action?: () => void
}


export const HelpScreen = observer(function HelpScreen() {
  const navigation = useNavigation()
  const { translate, color } = useMixins()
  
  const items: Item[] = [
    {
      name: translate('help.help_center'),
      disabled: true
    },
    {
      name: translate('help.terms'),
      action: () => {
        Linking.openURL(TERMS_URL)
      }
    },
    {
      name: translate('help.policy'),
      action: () => {
        Linking.openURL(PRIVACY_POLICY_URL)
      }
    }
  ]

  return (
    <Layout
      header={(
        <Header
          goBack={() => navigation.goBack()}
          title={translate('common.help')}
          right={(<View style={{ width: 10 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <View style={[commonStyles.GRAY_SCREEN_SECTION, {
        backgroundColor: color.background
      }]}>
        {
          items.map((item, index) => (
            <Button
              key={index}
              preset="link"
              isDisabled={item.disabled}
              onPress={item.action}
              style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
                borderBottomColor: color.line,
                borderBottomWidth: index !== items.length - 1 ? 1 : 0,
                justifyContent: 'space-between',
                paddingVertical: 16
              }]}
            >
              <Text
                preset="black"
                text={item.name}
              />
              <FontAwesomeIcon
                name="angle-right"
                size={18}
                color={color.textBlack}
              />
            </Button>
          ))
        }
      </View>
    </Layout>
  )
})
