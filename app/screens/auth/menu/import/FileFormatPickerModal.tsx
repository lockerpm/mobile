import React, { useCallback, useState } from "react"
import { View,  Keyboard, FlatList, TouchableHighlight } from "react-native"
import { useTheme } from "app/services/context"
import Modal from "react-native-modal"
import { Text, Screen, Header, Icon } from "app/components/cores"
import { SettingsItem } from "app/components/utils"
import { useHelper } from "app/services/hook"

interface Props {
  format: string
  formats: {
    label: string
    value: string
  }[]
  setFormat: (val: string) => void
}

export const FileFormatPickerModal = ({ format, setFormat, formats }: Props) => {
  const { colors } = useTheme()
  const { translate } = useHelper()
  const [isOpen, setIsOpen] = useState(false)

  const onClose = () => setIsOpen(false)
  const closeSheet = useCallback(() => {
    Keyboard.dismiss()
    setTimeout(onClose, 200)
  }, [])

  const handleSelect = (code: string) => {
    setFormat(code)
    closeSheet()
  }
  // render
  const renderItem = ({ item }) => (
    <TouchableHighlight
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
    </TouchableHighlight>
  )

  return (
    <View>
      <SettingsItem
        onPress={() => setIsOpen(true)}
        name={translate("import.format")}
        RightAccessory={<Text text={formats.find((i) => i.value === format).label} />}
      />
      <Modal
        animationIn="slideInRight"
        animationOut="slideOutRight"
        isVisible={isOpen}
        onBackdropPress={onClose}
        style={{
          margin: 0,
        }}
      >
        <Screen
          header={<Header leftIcon="arrow-left" onLeftPress={onClose} title={translate("import.format")} />}
          contentContainerStyle={{
            flex: 1,
          }}
        >
          <FlatList
            data={formats}
            keyboardShouldPersistTaps="never"
            keyExtractor={(item) => item.label}
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
    </View>
  )
}
