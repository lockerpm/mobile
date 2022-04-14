import React from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { useNavigation } from "@react-navigation/core"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { Button, Header, Layout, Text, AutoImage as Image } from "../../../../../components"
import { commonStyles, fontSize } from "../../../../../theme"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'


export const DataBreachListScreen = observer(() => {
  const { translate, color } = useMixins()
  const navigation = useNavigation()
  const { toolStore } = useStores()

  return (
    <Layout
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title={toolStore.breachedEmail}
          goBack={() => navigation.goBack()}
          right={(
            <View style={{ width: 30 }} />
          )}
        />
      )}
    >
      {
        toolStore.breaches.length === 0 ? (
          <View style={[commonStyles.GRAY_SCREEN_SECTION, {
            paddingVertical: 16,
            backgroundColor: color.background
          }]}>
            <Text
              preset="bold"
              text={translate('data_breach_scanner.good_news').toUpperCase()}
              style={{
                marginBottom: 7,
                color: color.primary
              }}
            />
            <Text
              preset="black"
              text={`${toolStore.breachedEmail}${translate('data_breach_scanner.no_breaches_found')}`}
            />
          </View>
        ) : (
          <View>
            <View style={[commonStyles.GRAY_SCREEN_SECTION, {
              paddingVertical: 16,
              marginBottom: 20,
              backgroundColor: color.background
            }]}>
              <Text
                preset="bold"
                text={translate('data_breach_scanner.bad_news').toUpperCase()}
                style={{
                  marginBottom: 7,
                  color: color.error
                }}
              />
              <Text
                preset="black"
                text={`${toolStore.breachedEmail}${translate('data_breach_scanner.breaches_found', { count: toolStore.breaches.length })}`}
              />
            </View>

            <View style={[commonStyles.GRAY_SCREEN_SECTION, {
              backgroundColor: color.background
            }]}>
              {
                toolStore.breaches.map((item, index) => (
                  <Button
                    key={index}
                    preset="link"
                    onPress={() => {
                      toolStore.setSelectedBreach(item)
                      navigation.navigate('dataBreachDetail')
                    }}
                    style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
                      borderBottomColor: color.line,
                      borderBottomWidth: index !== toolStore.breaches.length - 1 ? 1 : 0,
                      justifyContent: 'space-between',
                      paddingVertical: 16,
                    }]}
                  >
                    <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
                      <View
                        style={{
                          height: 40,
                          width: 40,
                          marginRight: 10
                        }}
                      >
                        <Image
                          source={{ uri: item.logo_path }}
                          style={{
                            flex: 1,
                            height: undefined,
                            width: undefined
                          }}
                          resizeMode="contain"
                        />
                      </View>

                      <View>
                        <Text
                          preset="black"
                          text={item.title}
                        />
                        <Text
                          text={item.domain}
                          style={{
                            marginTop: 3,
                            fontSize: fontSize.small
                          }}
                        />
                      </View>
                    </View>
                    
                    <FontAwesomeIcon
                      name="angle-right"
                      size={18}
                      color={color.textBlack}
                    />
                  </Button>
                ))
              }
            </View>
          </View>
        )
      }
    </Layout>
  )
})
