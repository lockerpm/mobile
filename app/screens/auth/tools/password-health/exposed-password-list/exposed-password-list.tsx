import React from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../../../models"
import { useMixins } from "../../../../../services/mixins"
import { Button, Header, Layout, AutoImage as Image, Text } from "../../../../../components"
import { FlatList, View } from "react-native"
import { CipherView } from "../../../../../../core/models/view"
import { commonStyles, fontSize } from "../../../../../theme"
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { BROWSE_ITEMS } from "../../../../../common/mappings"


export const ExposedPasswordList = observer(() => {
  const navigation = useNavigation()
  const { toolStore, cipherStore } = useStores()
  const { translate, getWebsiteLogo, color } = useMixins()

  // -------------- COMPUTED ------------------

  const listData = toolStore.exposedPasswords.map((c: CipherView) => {
    return {
      ...c,
      logo: BROWSE_ITEMS.password.icon,
      imgLogo: c.login.uri ? getWebsiteLogo(c.login.uri) : null,
      count: toolStore.exposedPasswordMap && toolStore.exposedPasswordMap.get(c.id)
    }
  })

  // -------------- METHODS ------------------

  // Go to detail
  const goToDetail = (item) => {
    cipherStore.setSelectedCipher(item)
    navigation.navigate('passwords__info')
  }

  // Get cipher description
  const getDescription = (item) => {
    return item.login.username
  }

  // -------------- RENDER ------------------

  const renderItem = ({ item }) => (
    <Button
      preset="link"
      onPress={() => goToDetail(item)}
      style={{
        borderBottomColor: color.line,
        borderBottomWidth: 0.5,
        paddingVertical: 15,
        height: 70.5
      }}
    >
      <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
        <Image
          source={item.imgLogo || item.logo}
          backupSource={item.logo}
          style={{
            height: 40,
            width: 40,
            borderRadius: 8
          }}
        />

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={[commonStyles.CENTER_HORIZONTAL_VIEW]}>
            <View style={{ flex: 1 }}>
              <Text
                preset="semibold"
                text={item.name}
                numberOfLines={1}
                style={{
                  marginRight: 7
                }}
              />
            </View>

            {
              item.organizationId && (
                <View style={{ marginRight: 7 }}>
                  <MaterialCommunityIconsIcon
                    name="account-group-outline"
                    size={22}
                    color={color.textBlack}
                  />
                </View>
              )
            }

            <View style={{
                paddingHorizontal: 10,
                paddingVertical: 2,
                backgroundColor: color.warning,
                borderRadius: 3
              }}>
                <Text
                  text={`${item.count} ${translate('common.times')}`}
                  style={{
                    fontWeight: 'bold',
                    color: color.white,
                    fontSize: fontSize.mini
                  }}
                />
              </View>
          </View>

          {
            !!getDescription(item) && (
              <Text
                text={getDescription(item)}
                style={{ fontSize: fontSize.small }}
                numberOfLines={1}
              />
            )
          }
        </View>
      </View>
    </Button>
  )

  return (
    <Layout
      header={(
        <Header
          title={translate('pass_health.exposed_passwords.name')}
          goBack={() => navigation.goBack()}
          right={(
            <View style={{ width: 10 }} />
          )}
        />
      )}
      borderTop
      noScroll
    >
      <View style={{ flex: 1 }}>
        <FlatList
          style={{ paddingHorizontal: 20 }}
          data={listData}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={(
            <Text
              text={translate('common.nothing_here')}
              style={{
                textAlign: 'center',
                marginTop: 20
              }}
            />
          )}
          renderItem={renderItem}
          getItemLayout={(data, index) => ({
            length: 71,
            offset: 71 * index,
            index
          })}
        />
      </View>
    </Layout>
  )
})
