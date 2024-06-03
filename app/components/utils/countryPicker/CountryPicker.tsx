import React, { useCallback, useState } from "react"
import Countries from "app/static/countries.json"
import Flags from "app/static/flags.json"
import { View, Image, Keyboard, FlatList } from "react-native"
import { TouchableHighlight, Text, Icon, Screen, Header } from "../../cores"
import { useTheme } from "app/services/context"
import { SearchBar } from "../searchBar/SearchBar"
import Modal from "react-native-modal"

export type CountryCode = keyof typeof Countries

interface Props {
  /**
   * Init selected value on list
   */
  value: CountryCode
  /**
   * callback function when user select other country code
   */
  onValueChange: (val: CountryCode) => void
  /**
   * Open Country picker bottom sheet
   */
  isOpen: boolean
  /**
   * Call back when sheet close
   */
  onClose: () => void
}

export const CountryPicker = ({ value, onValueChange, isOpen, onClose }: Props) => {
  const { colors } = useTheme()
  const [search, setSearch] = useState("")

  const items = Object.keys(Countries).map((code) => {
    return {
      ...Countries[code],
      country_code: code,
      flag: Flags[code],
    }
  })

  const closeSheet = useCallback(() => {
    Keyboard.dismiss()
    setTimeout(onClose, 200)
  }, [])

  const handleSelect = (code: CountryCode) => {
    onValueChange(code)
    closeSheet()
  }
  // render
  const renderItem = ({ item }) => (
    <TouchableHighlight
      onPress={() => handleSelect(item.country_code)}
      style={{
        height: 52.2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 15,
        }}
      >
        <Image
          resizeMode="contain"
          source={{ uri: item.flag }}
          style={{
            height: 22,
            width: 34,
          }}
        />
        <Text text={item.country_name} style={{ flex: 1, paddingHorizontal: 10 }} />
        {value === item.country_code && <Icon icon="check" size={16} color={colors.primary} />}
      </View>
    </TouchableHighlight>
  )

  return (
    <Modal
      animationIn="slideInUp"
      isVisible={isOpen}
      onBackdropPress={onClose}
      style={{
        margin: 0,
      }}
      onModalHide={() => {
        setSearch("")
      }}
    >
      <Screen
        safeAreaEdges={["top"]}
        header={<Header leftIcon="x" onLeftPress={onClose} />}
        contentContainerStyle={{
          flex: 1,
        }}
      >
        <SearchBar
          value={search}
          onChangeText={setSearch}
          containerStyle={{ marginVertical: 8, marginHorizontal: 16 }}
        />
        <FlatList
          data={items.filter(
            (i) =>
              !search.trim() ||
              i.country_name.toUpperCase().includes(search.toUpperCase()) ||
              i.country_code.includes(search.toUpperCase())
          )}
          keyboardShouldPersistTaps="never"
          keyExtractor={(item) => item.country_code}
          renderItem={renderItem}
          contentContainerStyle={{
            backgroundColor: colors.background,
          }}
          getItemLayout={(data, index) => ({
            length: 52.2,
            offset: 52.2 * index,
            index,
          })}
        />
      </Screen>
    </Modal>
  )
}
