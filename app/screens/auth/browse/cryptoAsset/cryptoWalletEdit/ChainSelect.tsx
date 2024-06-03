import { Select } from "app/components/utils"
import { useTheme } from "app/services/context"
import { CHAIN_LIST } from "app/utils/crypto/chainlist"
import React from "react"
import { ImageStyle, View, ViewStyle, Image } from "react-native"
import { Icon, Text } from "app/components/cores"
import { useHelper } from "app/services/hook"

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

  return (
    <Select
      showSearch
      multiple
      value={selected.map((i) => i.alias)}
      onChange={(values) => {
        const chains = values.map((alias: string) => findChain(alias))
        onChange(chains)
      }}
      options={CHAIN_LIST.map((c) => ({
        label: c.name,
        value: c.alias,
      }))}
      title={translate("crypto_asset.network")}
      renderItem={(value, { isSelected }, itemLabel) => (
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
              source={findChain(value)?.logo || otherChain.logo}
              borderRadius={20}
              style={IMG}
            />
          </View>
          <Text text={itemLabel} style={{ flex: 1, marginRight: 20 }} />
          {isSelected && <Icon icon="check" color={colors.primary} size={24} />}
        </View>
      )}
      renderSelected={() => (
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
      )}
    />
  )
}
