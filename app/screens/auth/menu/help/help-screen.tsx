import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Linking, View } from "react-native"
import { Layout, Text, Button, Header } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles } from "../../../../theme"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { useMixins } from "../../../../services/mixins"
import { PRIVACY_POLICY_URL, TERMS_URL, HELP_CENTER_URL, REPORT_VULN } from "../../../../config/constants"
import { FeedbackModal } from "./feedback-modal"
import { Logger } from "../../../../utils/logger"

type Item = {
  name: string
  disabled?: boolean
  action?: () => void
}


export const HelpScreen = observer(function HelpScreen() {
  const navigation = useNavigation()
  const { translate, color } = useMixins()

  const [showFeedback, setShowFeedback] = useState(false)

  const items: Item[] = [
    {
      name: translate('help.help_center'),
      action: () => {
        Linking.canOpenURL(HELP_CENTER_URL).then((val) => {
          if (val) Linking.openURL(HELP_CENTER_URL)
        }).catch(e => Logger.error(e))
      }
    },
    {
      name: translate('help.terms'),
      action: () => {
        Linking.canOpenURL(TERMS_URL).then((val) => {
          if (val) Linking.openURL(TERMS_URL)
        }).catch(e => Logger.error(e))
      }
    },
    {
      name: translate('help.policy'),
      action: () => {
        Linking.canOpenURL(PRIVACY_POLICY_URL).then((val) => {
          if (val) Linking.openURL(PRIVACY_POLICY_URL)
        }).catch(e => Logger.error(e))
      }
    },
    {
      name: translate('help.report_vuln'),
      action: () => {
        Linking.canOpenURL(REPORT_VULN).then((val) => {
          if (val) Linking.openURL(REPORT_VULN)
        }).catch(e => Logger.error(e))
      }
    },
  ]

  return (
    <Layout
      header={(
        <Header
          goBack={() => navigation.goBack()}
          title={translate('common.help')}
          right={(<View style={{ width: 30 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />

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
