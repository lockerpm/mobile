import React from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome'
import { Text, Button, Layout, AutoImage as Image } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../../theme"
import { TOOLS_ITEMS } from "../../../../common/mappings"
import { useMixins } from "../../../../services/mixins"
import { useStores } from "../../../../models"
import { PlanType } from "../../../../config/types"

export const ToolsListScreen = observer(() => {
  const navigation = useNavigation()
  const { user, uiStore } = useStores()
  const { translate, color } = useMixins()

  const isFreeAccount = user.plan && user.plan.alias === PlanType.FREE
  return (
    <Layout
      borderBottom
      hasBottomNav
      containerStyle={{ 
        backgroundColor: uiStore.isDark ? color.background : color.block, 
        paddingTop: 0 
      }}
      header={(
        <Text preset="largeHeader" text={translate('common.tools')} />
      )}
    >
      <View
        style={{
          backgroundColor: uiStore.isDark ? color.block : color.background,
          borderRadius: 10,
          paddingHorizontal: 14,
          marginTop: 20
        }}
      >
        {
          Object.values(TOOLS_ITEMS).map((item, index) => (
            <Button
              key={index}
              preset="link"
              isDisabled={item.premium && isFreeAccount}
              onPress={() => {
                if (item.routeName === 'authenticator') {
                  navigation.navigate('mainTab', { screen: 'authenticatorTab' })
                } else {
                  navigation.navigate(item.routeName, { fromTools: true })
                }
              }}
              style={{
                borderBottomColor: color.line,
                borderBottomWidth: index === Object.keys(TOOLS_ITEMS).length - 1 ? 0 : 1,
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
              <View
                style={{ flex: 1, paddingHorizontal: 10 }}
              >
                <View
                  style={[commonStyles.CENTER_HORIZONTAL_VIEW, { flexWrap: 'wrap' }]}
                >
                  <Text
                    tx={item.label}
                    style={{ 
                      color: color.title, 
                      marginBottom: 3,
                      marginRight: item.premium ? 7 : 0
                    }}
                  />

                  {
                    item.premium && isFreeAccount && (
                      <View style={{
                        paddingHorizontal: 10,
                        paddingVertical: 2,
                        backgroundColor: color.textBlack,
                        borderRadius: 3
                      }}>
                        <Text
                          text="PREMIUM"
                          style={{
                            fontWeight: 'bold',
                            color: color.background,
                            fontSize: fontSize.mini
                          }}
                        />
                      </View>
                    )
                  }
                </View>
                
                <Text
                  tx={item.desc}
                  style={{ fontSize: fontSize.small }}
                />
              </View>
              <Icon name="angle-right" size={20} color={color.title} />
            </Button>
          ))
        }
      </View>
    </Layout>
  )
})
