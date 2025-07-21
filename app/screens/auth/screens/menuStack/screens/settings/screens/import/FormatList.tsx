import { useState } from "react"
import { View, FlatList, StyleSheet, TouchableOpacity, ViewStyle } from "react-native"
import { Text, Icon } from "app/components/cores"
import { SearchBar } from "app/components/utils"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

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
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFormats, setFilteredFormats] = useState(formats)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query) {
      const filtered = formats.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredFormats(filtered)
    } else {
      setFilteredFormats(formats)
    }
  }

  const handleSelect = (code: string) => {
    setFormat(code)
  }

  return (
    <View>
      <FlatList
        data={filteredFormats}
        keyExtractor={(item) => item.value}
        ListHeaderComponent={
          <SearchBar placeholder="Search formats" value={searchQuery} onChangeText={handleSearch} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelect(item.value)}>
            <View style={styles.item}>
              <Text text={item.label} style={styles.label} />
              {format === item.value && <Icon icon="check" size={16} color={colors.primary} />}
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={themed($divider)} />}
        getItemLayout={(data, index) => ({
          length: 52.2,
          offset: 52.2 * index,
          index,
        })}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  )
}

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.border,
})

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
  },
  item: {
    alignItems: "center",
    flexDirection: "row",
    height: 52.2,
    paddingVertical: 15,
  },
  label: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
})
