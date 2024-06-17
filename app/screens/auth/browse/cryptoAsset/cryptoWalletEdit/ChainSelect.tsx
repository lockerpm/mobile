import { useTheme } from "app/services/context"
import { CHAIN_LIST } from "app/utils/crypto/chainlist"
import React, { useState } from "react"
import { ImageStyle, View, ViewStyle, Image, FlatList } from "react-native"
import { Icon, Text, Screen, Header } from "app/components/cores"
import { useHelper } from "app/services/hook"
import Modal from "react-native-modal"
import { TouchableOpacity } from "react-native-gesture-handler"

type Props = {
  selected: {
    alias: string
    name: string
  }[]
  onChange: (items: { alias: string; name: string }[]) => void
}

export const ChainSelect = (props: Props) => {
  const { onChange, selected } = props
  const { colors } = useTheme()
  const { translate } = useHelper()

  // ------------------ METHODS ------------------

  const [isSelect, setIsSelect] = useState(false)

  const onClose = () => setIsSelect(false)

  const setChain = (value) => {
    onChange([value])
    setIsSelect(false)
  }

  const findChain = (al: string) => {
    return CHAIN_LIST.find((c) => c.alias === al)
  }

  // ------------------ COMPUTED ------------------

  const otherChain = findChain("other")

  // ------------------ RENDER ------------------

  const IMG_CONTAINER: ViewStyle = {
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  }

  const IMG: ImageStyle = {
    borderRadius: 20,
    height: 40,
    width: 40,
    backgroundColor: "white",
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => setChain(item)}>
      <View
        style={{
          backgroundColor: colors.background,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <View style={IMG_CONTAINER}>
          <Image
            resizeMode="contain"
            source={item.logo || otherChain.logo}
            borderRadius={20}
            style={IMG}
          />
        </View>
        <Text text={item.name} style={{ flex: 1, marginRight: 20 }} />
        {selected?.find((c) => c.alias === item.alias) && <Icon icon="check" color={colors.primary} size={24} />}
      </View>
    </TouchableOpacity>
  )

  return (
    <View>
      <TouchableOpacity onPress={() => setIsSelect(true)}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                preset="label"
                size="base"
                text={translate("crypto_asset.network")}
                style={{ marginBottom: 5 }}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 1,
                  flexWrap: "wrap",
                }}
              >
                {selected.length ? (
                  selected.map((item) => {
                    const selectedChain = findChain(item.alias)
                    return (
                      <View
                        key={item.alias}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 12,
                          marginVertical: 2,
                        }}
                      >
                        <View style={IMG_CONTAINER}>
                          <Image
                            resizeMode="contain"
                            source={selectedChain?.logo || otherChain.logo}
                            borderRadius={20}
                            style={IMG}
                          />
                        </View>

                        <Text text={item.name} />
                      </View>
                    )
                  })
                ) : (
                  <Text text={translate("common.none")} />
                )}
              </View>
            </View>
            <Icon icon="caret-right" size={20} color={colors.title} />
          </View>
        </View>
      </TouchableOpacity>
      <Modal
        animationIn="slideInRight"
        animationOut="slideOutRight"
        isVisible={isSelect}
        onBackdropPress={onClose}
        style={{
          margin: 0,
        }}
      >
        <Screen
          header={
            <Header
              leftIcon="arrow-left"
              onLeftPress={onClose}
              title={translate("crypto_asset.network")}
            />
          }
          contentContainerStyle={{
            flex: 1,
          }}
        >
          <FlatList
            data={CHAIN_LIST}
            keyboardShouldPersistTaps="never"
            keyExtractor={(item) => item.alias}
            renderItem={renderItem}
            contentContainerStyle={{
              backgroundColor: colors.background,
            }}
          />
        </Screen>
      </Modal>
    </View>
  )
}
