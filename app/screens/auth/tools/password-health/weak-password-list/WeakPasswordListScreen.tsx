import React, { FC } from 'react'
import { FlatList } from 'react-native'
import { LoadingHeader } from '../LoadingHeader'
import { ListItem } from './list-item'
import { BROWSE_ITEMS, ToolsStackScreenProps } from 'app/navigators'
import { useStores } from 'app/models'
import { useCipherHelper } from 'app/services/hook'
import { CipherView } from 'core/models/view'
import { Header, Screen, Text } from 'app/components-v2/cores'
import { translate } from 'app/i18n'

export const WeakPasswordListScreen: FC<ToolsStackScreenProps<'weakPasswordList'>> = (props) => {
  const navigation = props.navigation
  const { toolStore, cipherStore } = useStores()
  const { getWebsiteLogo } = useCipherHelper()

  // -------------- COMPUTED ------------------

  const listData = toolStore.weakPasswords.map((c: CipherView) => {
    return {
      ...c,
      logo: BROWSE_ITEMS.password.icon,
      imgLogo: c.login.uri ? getWebsiteLogo(c.login.uri) : null,
      strength: toolStore.passwordStrengthMap && toolStore.passwordStrengthMap.get(c.id),
    }
  })

  // -------------- METHODS ------------------

  // Go to detail
  const goToDetail = (item) => {
    cipherStore.setSelectedCipher(item)
    navigation.navigate('passwords__info')
  }

  // -------------- RENDER ------------------

  const renderItem = ({ item }) => <ListItem item={item} goToDetail={goToDetail} />

  return (
    <Screen
      header={
        <Header
          title={translate('pass_health.weak_passwords.name')}
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
        />
      }
      contentContainerStyle={{
        flex: 1,
      }}
    >
      <LoadingHeader />

      <FlatList
        style={{ paddingHorizontal: 20 }}
        data={listData}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text
            text={translate('common.nothing_here')}
            style={{
              textAlign: 'center',
              marginTop: 20,
            }}
          />
        }
        renderItem={renderItem}
        getItemLayout={(data, index) => ({
          length: 71,
          offset: 71 * index,
          index,
        })}
      />
    </Screen>
  )
}
