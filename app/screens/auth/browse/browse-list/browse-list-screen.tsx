import React from "react"
import { View } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome'
import { Text, Button, Layout, AutoImage as Image } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { BROWSE_ITEMS } from "../../../../common/mappings"
import { useMixins } from "../../../../services/mixins"
import { commonStyles } from "../../../../theme"
import { useStores } from "../../../../models"
import { observer } from "mobx-react-lite"


export const BrowseListScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, color, isDark } = useMixins()
  const { cipherStore } = useStores()

  const data = Object.keys(BROWSE_ITEMS).map(key => {
    return {
      ...BROWSE_ITEMS[key],
      notiCount: key === 'shares' ? cipherStore.sharingInvitations.length : 0
    }
  })
  
  return (
    <Layout
      borderBottom
      containerStyle={{ 
        backgroundColor: isDark ? color.background : color.block, 
        paddingTop: 0 
      }}
      header={(
        <Text preset="largeHeader" text={translate('common.browse')} />
      )}
    >
      <View
        style={{
          backgroundColor: isDark ? color.block : color.background,
          borderRadius: 10,
          paddingHorizontal: 14,
          marginTop: 20
        }}
      >
        {
          data.map((item, index) => (
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
              <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { flex: 1, paddingHorizontal: 10 }]}>
                <Text
                  tx={item.label}
                  style={{ color: color.title, marginRight: 10 }}
                />
                {
                  (item.notiCount > 0) && (
                    <View
                      style={{
                        backgroundColor: color.error,
                        borderRadius: 20,
                        minWidth: 17,
                        height: 17
                      }}
                    >
                      <Text
                        text={item.notiCount.toString()}
                        style={{
                          fontSize: 12,
                          textAlign: 'center',
                          color: color.white,
                          lineHeight: 17
                        }}
                      />
                    </View>
                  )
                }
              </View>
              <Icon name="angle-right" size={20} color={color.title} />
            </Button>
          ))
        }
      </View>
    </Layout>
  )
})
