import React from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../../../models"
import { useMixins } from "../../../../../services/mixins"
import { Button, Header, Layout, AutoImage as Image, Text } from "../../../../../components"
import { FlatList, View } from "react-native"
import { CipherView } from "../../../../../../core/models/view"
import { color, commonStyles, fontSize } from "../../../../../theme"
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { BROWSE_ITEMS } from "../../../../../common/mappings"


export const ReusePasswordList = observer(function ReusePasswordList() {
  const navigation = useNavigation()
  const { toolStore, cipherStore } = useStores()
  const { translate, getWebsiteLogo } = useMixins()

  // -------------- COMPUTED ------------------

  const listData = toolStore.reusedPasswords.map((c: CipherView) => {
    return {
      ...c,
      logo: BROWSE_ITEMS.password.icon,
      imgLogo: c.login.uri ? getWebsiteLogo(c.login.uri) : null,
      count: toolStore.passwordUseMap && toolStore.passwordUseMap.get(c.login.password)
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

  return (
    <Layout
      header={(
        <Header
          title={translate('pass_health.reused_passwords.name')}
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
          renderItem={({ item }) => (
            <Button
              preset="link"
              onPress={() => goToDetail(item)}
              style={{
                borderBottomColor: color.line,
                borderBottomWidth: 1,
                paddingVertical: 15
              }}
            >
              <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
                <Image
                  source={item.imgLogo || item.logo}
                  backupSource={item.logo}
                  style={{
                    height: 40,
                    width: 40
                  }}
                />

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { flexWrap: 'wrap' }]}>
                    <Text
                      preset="semibold"
                      text={item.name}
                    />

                    {
                      item.organizationId && (
                        <View style={{ marginLeft: 10 }}>
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
                        borderRadius: 3,
                        marginLeft: 7
                      }}>
                        <Text
                          text={`${item.count} ${translate('common.times')}`}
                          style={{
                            fontWeight: 'bold',
                            color: color.palette.white,
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
                      />
                    )
                  }
                </View>
              </View>
            </Button>
          )}
        />
      </View>
    </Layout>
  )
})
