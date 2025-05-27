import React, { useState } from "react"
import {
  FlatList,
  ImageStyle,
  TouchableHighlight,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { Text, AutoImage as Image, Icon, Screen, Header } from "app/components/cores"
import { WALLET_APP_LIST } from "app/utils/crypto/applist"
import { useAppLocale, useTheme } from "app/services/context"
import Modal from "react-native-modal"

type Props = {
  alias: string
  onChange: (alias: string, name: string) => void
}

export const AppSelect = (props: Props) => {
  const { onChange, alias } = props
  const { colors } = useTheme()
  const { translate } = useAppLocale()

  // ------------------ METHODS ------------------
  const [isSelect, setIsSelect] = useState(false)

  const findApp = (al: string) => {
    return WALLET_APP_LIST.find((c) => c.alias === al)
  }

  const onClose = () => setIsSelect(false)

  const setAlias = (app: any) => {
    setIsSelect(false)
    onChange(app.alias, app.name)
  }

  // ------------------ COMPUTED ------------------

  const selectedApp = findApp(alias)
  const otherApp = findApp("other")

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
    <TouchableHighlight onPress={() => setAlias(item)}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.background,
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <View style={IMG_CONTAINER}>
          <Image
            resizeMode="contain"
            source={item?.logo || otherApp.logo}
            borderRadius={20}
            style={IMG}
          />
        </View>
        <Text text={item.name} style={{ flex: 1, marginRight: 20 }} />
        {item.alias === alias && <Icon icon="check" color={colors.primary} size={24} />}
      </View>
    </TouchableHighlight>
  )

  return (
    <View>
      <TouchableOpacity onPress={() => setIsSelect(true)}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              justifyContent: "space-between",
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                preset="label"
                size="base"
                text={translate("crypto_asset.wallet_app")}
                style={{ marginBottom: 5 }}
              />
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {!!alias && (
                  <View style={IMG_CONTAINER}>
                    <Image
                      resizeMode="contain"
                      source={selectedApp?.logo || otherApp.logo}
                      borderRadius={20}
                      style={IMG}
                    />
                  </View>
                )}
                <Text text={selectedApp?.name || translate("common.none")} />
              </View>
            </View>
            <Icon icon="caret-right" size={20} color={colors.secondaryText} />
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
              title={translate("crypto_asset.wallet_app")}
            />
          }
          contentContainerStyle={{
            flex: 1,
          }}
        >
          <FlatList
            data={WALLET_APP_LIST}
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
