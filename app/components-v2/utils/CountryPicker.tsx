import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import Countries from "../../static/countries.json"
import Flags from "../../static/flags.json"
import { View, StyleSheet, Modal, TouchableWithoutFeedback, Image, Keyboard } from "react-native"
import { TouchableHighlight, Text, Icon } from "../cores"
// import { useTheme } from "app/services/hook"
import { SearchBar } from "./searchBar/SearchBar"
import { useMixins } from "../../services/mixins"

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
  const { color: colors } = useMixins()

  const [search, setSearch] = useState("")

  const items = Object.keys(Countries).map((code) => {
    return {
      ...Countries[code],
      country_code: code,
      flag: Flags[code],
    }
  })

  // ref
  const sheetRef = useRef<BottomSheet>(null)

  // variables
  const snapPoints = useMemo(() => ["45%", "90%"], [])

  const showSheet = useCallback(() => {
    sheetRef.current?.snapToIndex(0)
  }, [])

  const showFullSheet = useCallback(() => {
    sheetRef.current?.snapToIndex(1)
  }, [])

  const closeSheet = useCallback(() => {
    sheetRef.current?.close()
    Keyboard.dismiss()
    setTimeout(onClose, 200)
  }, [])

  const onSheetChange = useCallback((index: number) => {
    if (index === 0) {
      Keyboard.dismiss()
    }
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

  useEffect(() => {
    if (isOpen) {
      setTimeout(showSheet, 200)
    }
  }, [isOpen])

  return (
    <Modal transparent animationType="fade" visible={isOpen}>
      <View
        style={{
          flex: 1,
        }}
      >
        <BottomSheet
          index={-1}
          ref={sheetRef}
          snapPoints={snapPoints}
          onClose={onClose}
          onChange={onSheetChange}
          backdropComponent={() => (
            <TouchableWithoutFeedback onPress={closeSheet} style={{ flex: 1 }}>
              <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.1)" }} />
            </TouchableWithoutFeedback>
          )}
        >
          <SearchBar
            value={search}
            onChangeText={setSearch}
            containerStyle={{ marginVertical: 8, marginHorizontal: 16 }}
            onFocus={showFullSheet}
          />
          <BottomSheetFlatList
            data={items.filter(
              (i) =>
                !search.trim() ||
                i.country_name.toUpperCase().includes(search.toUpperCase()) ||
                i.country_code.includes(search.toUpperCase()),
            )}
            keyboardShouldPersistTaps="never"
            keyExtractor={(item) => item.country_code}
            renderItem={renderItem}
            contentContainerStyle={styles.contentContainer}
            getItemLayout={(data, index) => ({
              length: 52.2,
              offset: 52.2 * index,
              index,
            })}
          />
        </BottomSheet>
      </View>
    </Modal>
  )
}
const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: "white",
  },
  
})
