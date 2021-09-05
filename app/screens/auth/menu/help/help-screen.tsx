import React from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Text, Button, Header } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, commonStyles } from "../../../../theme"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { translate } from "../../../../i18n"


type Item = {
  name: string
}


export const HelpScreen = observer(function HelpScreen() {
  const navigation = useNavigation()

  const items: Item[] = [
    {
      name: translate('help.help_center')
    },
    {
      name: translate('help.terms')
    },
    {
      name: translate('help.policy')
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
      <View style={commonStyles.GRAY_SCREEN_SECTION}>
        {
          items.map((item, index) => (
            <Button
              key={index}
              preset="link"
              style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
                borderBottomColor: color.line,
                borderBottomWidth: 1,
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
