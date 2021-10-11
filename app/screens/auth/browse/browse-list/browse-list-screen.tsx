import React from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome'
import { Text, Button, Layout, AutoImage as Image } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { color } from "../../../../theme"
import { BROWSE_ITEMS } from "../../../../common/mappings"
import { useMixins } from "../../../../services/mixins"

export const BrowseListScreen = observer(function BrowseListScreen() {
  const navigation = useNavigation()
  const { translate } = useMixins()
  
  return (
    <Layout
      style={{ backgroundColor: color.block }}
      containerStyle={{ backgroundColor: color.block, paddingTop: 0 }}
      header={(
        <Text preset="largeHeader" text={translate('common.browse')} />
      )}
    >
      <View
        style={{
          backgroundColor: color.palette.white,
          borderRadius: 10,
          paddingHorizontal: 14
        }}
      >
        {
          Object.values(BROWSE_ITEMS).map((item, index) => (
            <Button
              key={index}
              preset="link"
              onPress={() => {
                navigation.navigate(item.routeName)
              }}
              style={{
                borderBottomColor: color.line,
                borderBottomWidth: index === Object.keys(BROWSE_ITEMS).length - 1 ? 0 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12
              }}
            >
              {
                item.svgIcon ? (
                  <item.svgIcon height={40} width={40} />
                ) : (
                  <Image source={item.icon} style={{ height: 40, width: 40 }} />
                )
              }
              <Text
                tx={item.label}
                style={{ color: color.title, flex: 1, paddingHorizontal: 10 }}
              />
              <Icon name="angle-right" size={20} color={color.title} />
            </Button>
          ))
        }
      </View>
    </Layout>
  )
})
