import React from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../../../models"
import { useMixins } from "../../../../../services/mixins"
import { Header, Layout, Text } from "../../../../../components"
import { FlatList, View } from "react-native"
import { CipherView } from "../../../../../../core/models/view"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { LoadingHeader } from "../loading-header"
import { ListItem } from "./list-item"


export const ExposedPasswordList = observer(() => {
  const navigation = useNavigation()
  const { toolStore, cipherStore } = useStores()
  const { translate, getWebsiteLogo } = useMixins()

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

  // -------------- RENDER ------------------

  const renderItem = ({ item }) => (
    <ListItem
      item={item}
      goToDetail={goToDetail}
    />
  )

  return (
    <Layout
      header={(
        <Header
          title={translate('pass_health.exposed_passwords.name')}
          goBack={() => navigation.goBack()}
          right={(
            <View style={{ width: 30 }} />
          )}
        />
      )}
      borderTop
      noScroll
    >
      <View style={{ flex: 1 }}>
        <LoadingHeader />
        
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
