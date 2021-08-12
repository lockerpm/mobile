import React from "react"
import { observer } from "mobx-react-lite"
import { View, ScrollView, ViewStyle } from "react-native"
import { Button, Layout, Text, AutoImage as Image } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../../models"
import { color, commonStyles } from "../../../../theme"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'


const ITEM_CONTAINER: ViewStyle = {
  backgroundColor: color.palette.white,
  borderRadius: 10,
  paddingHorizontal: 14,
}

type MenuItemProps = {
  icon: string,
  name: string,
  noCaret?: boolean,
  noBorder?: boolean,
  action?: Function
}


export const MenuScreen = observer(function MenuScreen() {
  const navigation = useNavigation()
  const { user } = useStores()

  const items: MenuItemProps[] = [
    {
      icon: 'star-o',
      name: 'Go Premium Plan'
    },
    {
      icon: 'users',
      name: 'Invite friends'
    },
    {
      icon: 'gear',
      name: 'Settings',
      action: () => navigation.navigate('settings')
    },
    {
      icon: 'question-circle-o',
      name: 'Help',
      action: () => navigation.navigate('help'),
      noBorder: true
    }
  ]

  const MenuItem = (props: MenuItemProps) => {
    return (
      <Button
        preset="link"
        onPress={() => props.action && props.action()}
        style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
          paddingVertical: 16,
          borderBottomColor: color.line,
          borderBottomWidth: props.noBorder? 0 : 1
        }]}
      >
        <FontAwesomeIcon
          name={props.icon}
          size={18}
          color={color.textBlack}
        />
        <Text
          preset="black"
          text={props.name}
          style={{ flex: 1, paddingHorizontal: 10 }}
        />
        {
          !props.noCaret && (
            <FontAwesomeIcon
              name="angle-right"
              size={18}
              color={color.textBlack}
            />
          )
        }
      </Button>
    )
  }

  return (
    <Layout
      borderBottom
      containerStyle={{ backgroundColor: color.block }}
    >
      <Text
        preset="largeHeader"
        text="Menu"
        style={{ marginBottom: 16}}
      />
      <ScrollView>
        <View style={[
          ITEM_CONTAINER, 
          commonStyles.CENTER_HORIZONTAL_VIEW,
          { marginBottom: 15, paddingVertical: 14 }
        ]}>
          <Image
            source={{ uri: user.avatar }}
            style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
          />
          <View>
            <Text
              preset="black"
              text={user.email}
            />
            <Text style={{ fontSize: 10 }}>
              Free Account - EXP: 19 MAY 21
            </Text>
          </View>
        </View>

        <View style={[ITEM_CONTAINER, { marginBottom: 15 }]}>
          {
            items.map((item, index) => (
              <MenuItem
                key={index}
                {...item}
              />
            ))
          }
        </View>

        <View style={[ITEM_CONTAINER]}>
          <MenuItem
            icon="lock"
            name="Lock CyStack Locker Now"
            noBorder
            noCaret
          />
        </View>
      </ScrollView>
    </Layout>
  )
})
