import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View, FlatList, Image } from "react-native"
import { Button, Header, Layout, Text } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { color, commonStyles } from "../../../theme"
import { Input } from "native-base"
import Icon from 'react-native-vector-icons/FontAwesome'
import countries from '../../../common/countries.json'
import flags from '../../../common/flags.json'

export const CountrySelectorScreen = observer(function CountrySelectorScreen() {
  const navigation = useNavigation()

  const selectedCountry = 'VN'
  const [search, setSearch] = useState('')

  const items = Object.keys(countries).map((code) => {
    return {
      ...countries[code],
      country_code: code,
      flag: flags[code]
    }
  })

  return (
    <Layout
      noScroll
      header={(
        <Header
          goBack={() => navigation.goBack()}
          title="Choose Country"
          right={(
            <View style={{ width: 10 }} />
          )}
        >
          <View style={{ marginTop: 15 }}>
            <Input
              size="xs"
              placeholder="Search"
              value={search}
              onChangeText={setSearch}
              style={{ 
                backgroundColor: color.block, 
                paddingBottom: 5,
                paddingTop: 5 
              }}
              InputRightElement={
                <Button
                  preset="link"
                  style={{ paddingRight: 15, backgroundColor: color.block, height: 38 }}
                >
                  <Icon 
                    name="search"
                    size={16} 
                    color={color.text} 
                  />
                </Button>
              }
            />
          </View>
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
          >
            <View
              style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
                paddingHorizontal: 20,
                paddingVertical: 10
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
                selectedCountry === item.country_code && (
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
