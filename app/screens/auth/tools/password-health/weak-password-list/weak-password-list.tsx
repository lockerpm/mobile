import React from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../../../models"
import { useMixins } from "../../../../../services/mixins"
import { Button, Header, Layout, AutoImage as Image, Text, PasswordStrength } from "../../../../../components"
import { FlatList, View } from "react-native"
import { CipherView } from "../../../../../../core/models/view"
import { commonStyles, fontSize } from "../../../../../theme"
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { BROWSE_ITEMS } from "../../../../../common/mappings"


export const WeakPasswordList = observer(function WeakPasswordList() {
  const navigation = useNavigation()
  const { toolStore, cipherStore } = useStores()
  const { translate, getWebsiteLogo, color } = useMixins()

  // -------------- COMPUTED ------------------

  const listData = toolStore.weakPasswords.map((c: CipherView) => {
    return {
      ...c,
      logo: BROWSE_ITEMS.password.icon,
      imgLogo: c.login.uri ? getWebsiteLogo(c.login.uri) : null,
      strength: toolStore.passwordStrengthMap && toolStore.passwordStrengthMap.get(c.id)
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
          title={translate('pass_health.weak_passwords.name')}
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
                borderBottomWidth: 0.5,
                paddingVertical: 15
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
                      marginLeft: 7,
                      paddingBottom: 4
                    }}>
                      <PasswordStrength
                        preset="text"
                        value={item.strength}
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
