import React, { useState } from "react"
import { View, FlatList } from "react-native"
import { useTheme } from "app/services/context"
import { Text, Icon } from "app/components/cores"
import { SearchBar } from "app/components/utils"
import { TouchableOpacity } from "react-native-gesture-handler"

interface Format {
  label: string
  value: string
}

interface Props {
  format: string
  formats: Format[]
  setFormat: (val: string) => void
}

export const FormatList = ({ format, formats, setFormat }: Props) => {
  const { colors } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFormats, setFilteredFormats] = useState(formats)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query) {
      const filtered = formats.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()),
      )
      setFilteredFormats(filtered)
    } else {
      setFilteredFormats(formats)
    }
  }

  const handleSelect = (code: string) => {
    setFormat(code)
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item.value)}
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
        <Text text={item.label} style={{ flex: 1, paddingHorizontal: 10 }} />
        {format === item.value && <Icon icon="check" size={16} color={colors.primary} />}
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={{ flex: 1 }}>
      <SearchBar
        placeholder="Search formats"
        value={searchQuery}
        onChangeText={handleSearch}
        containerStyle={{
          marginHorizontal: 20,
        }}
      />
      <FlatList
        data={filteredFormats}
        keyExtractor={(item) => item.value}
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
    </View>
  )
}
