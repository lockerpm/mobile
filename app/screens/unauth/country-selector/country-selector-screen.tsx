import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View, FlatList, Image } from "react-native"
import { Button, Header, Layout, SearchBar, Text } from "../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { color, commonStyles } from "../../../theme"
import Icon from 'react-native-vector-icons/FontAwesome'
import countries from '../../../common/countries.json'
import flags from '../../../common/flags.json'
import { useMixins } from "../../../services/mixins"
import { RootParamList } from "../../../navigators/root-navigator"
import { useStores } from "../../../models"

type CountrySelectScreenProp = RouteProp<RootParamList, 'countrySelector'>;

export const CountrySelectorScreen = observer(function CountrySelectorScreen() {
  const navigation = useNavigation()
  const { uiStore } = useStores()
  const { translate } = useMixins()
  const route = useRoute<CountrySelectScreenProp>()
  const { initialId } = route.params

  const [search, setSearch] = useState('')

  const items = Object.keys(countries).map((code) => {
    return {
      ...countries[code],
      country_code: code,
      flag: flags[code]
    }
  })

  const handleSelect = (code: string) => {
    uiStore.setSelectedCountry(code)
    navigation.goBack()
  }

  return (
    <Layout
      noScroll
      header={(
        <Header
          goBack={() => navigation.goBack()}
          title={translate('common.country')}
          right={(
            <View style={{ width: 10 }} />
          )}
        >
          <SearchBar
            value={search}
            onSearch={setSearch}
            style={{ marginTop: 15 }}
          />
        </Header>
      )}
    >
      <FlatList
        data={items.filter(i => (
          !search.trim() 
          || i.country_name.toUpperCase().includes(search.toUpperCase())
          || i.country_code.includes(search.toUpperCase())
        ))}
        keyExtractor={item => item.country_code}
        renderItem={({ item }) => (
          <Button
            preset="link"
            onPress={() => handleSelect(item.country_code)}
          >
            <View
              style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
                paddingHorizontal: 20,
                paddingVertical: 15
              }]}
            >
              <Image
                source={{ uri: item.flag }}
                style={{
                  height: 22,
                  width: 34
                }}
              />
              <Text
                preset="black"
                text={item.country_name}
                style={{ flex: 1, paddingHorizontal: 10 }}
              />
              {
                initialId === item.country_code && (
                  <Icon
                    name="check"
                    size={16}
                    color={color.palette.green}
                  />
                )
              }
            </View>
          </Button>
        )}
      />
    </Layout>
  )
})
