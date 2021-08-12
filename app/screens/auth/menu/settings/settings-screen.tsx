import React from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Text, Button, Header } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, commonStyles } from "../../../../theme"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'


type ItemProps = {
  name: string,
  right?: JSX.Element,
  noCaret?: boolean,
  color?: string,
  action?: Function,
  noBorder?: boolean
}


export const SettingsScreen = observer(function SettingsScreen() {
  const navigation = useNavigation()

  const Item = (props: ItemProps) => {
    return (
      <Button
        preset="link"
        onPress={() => props.action && props.action()}
        style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
          borderBottomColor: color.line,
          borderBottomWidth: props.noBorder ? 0 : 1,
          justifyContent: 'space-between',
          paddingVertical: 16
        }]}
      >
        <Text
          preset="black"
          text={props.name}
          style={{ color: props.color || color.textBlack }}
        />
        {
          props.right || !props.noCaret && (
            <FontAwesomeIcon
              name="angle-right"
              size={18}
              color={props.color || color.textBlack}
            />
          )
        }
        
      </Button>
    )
  }

  return (
    <Layout
      header={(
        <Header
          goBack={() => navigation.goBack()}
          title="Settings"
          right={(<View style={{ width: 10 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <Text
        text="ACCOUNT"
        style={{ fontSize: 10, marginHorizontal: 20, marginBottom: 8 }}
      />
      <View style={commonStyles.GRAY_SCREEN_SECTION}>
        <Item
          name="Change Master Password"
          noBorder
          action={() => navigation.navigate('changeMasterPassword')}
        />
      </View>

      <View style={[commonStyles.GRAY_SCREEN_SECTION, { marginTop: 10 }]}>
        <Item
          name="Log Out"
          action={() => {}}
          noCaret
          noBorder
          color={color.error}
        />
      </View>
    </Layout>
  )
})
