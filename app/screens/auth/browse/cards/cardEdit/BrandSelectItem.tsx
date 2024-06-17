import React, { useState } from "react"
import { View, FlatList, TouchableOpacity } from "react-native"
import { useTheme } from "app/services/context"
import Modal from "react-native-modal"
import { Text, Screen, Header, Icon } from "app/components/cores"
import { useHelper } from "app/services/hook"
import { CARD_BRANDS } from "../constants"

interface Props {
  brand: string
  setBrand: (val: string) => void
}

export const BrandSelectItem = ({ brand, setBrand }: Props) => {
  const { colors } = useTheme()
  const { translate } = useHelper()

  const [isOpen, setIsOpen] = useState(false)

  const onClose = () => setIsOpen(false)

  const handleSelect = (code: string) => {
    setBrand(code)
    onClose()
  }
  // render
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item.value)}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 15,
          height: 52.2,
        }}
      >
        <Text text={item.label} style={{ flexGrow: 1}} />
        {brand === item.value && <Icon icon="check" size={16} color={colors.primary} />}
      </View>
    </TouchableOpacity>
  )

  return (
    <View>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.disable,
        }}
      >
        <View
          style={{
            justifyContent: "space-between",
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View>
            {!brand && <Text preset="label" size="base" text={translate("card.brand")} />}
            {!!brand && <Text preset="bold" text={brand} />}
          </View>
          <Icon icon="caret-right" size={20} color={colors.secondaryText} />
        </View>
      </TouchableOpacity>
      <Modal
        animationIn="slideInRight"
        animationOut="slideOutRight"
        isVisible={isOpen}
        onBackdropPress={onClose}
        style={{
          margin: 0,
          justifyContent: "flex-start"
        }}
      >
        <Screen
          header={
            <Header
              leftIcon="arrow-left"
              onLeftPress={onClose}
              title={translate("card.brand")}
            />
          }
          contentContainerStyle={{
            flex: 1,
          }}
        >
          <FlatList
            data={CARD_BRANDS}
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
