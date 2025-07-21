import { CHAIN_LIST } from "app/utils/crypto/chainlist"
import { useState } from "react"
import { View, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Icon, Text } from "app/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"
import { WalletChainsModal } from "./WalletChainsModal"

type Props = {
  selected: {
    alias: string
    name: string
  }[]
  onChange: (items: { alias: string; name: string }[]) => void
}

const chainOther = require("assets/images/icons/crypto/other.png")

export const ChainSelect = (props: Props) => {
  const { onChange, selected } = props
  const {
    theme: { colors },
  } = useAppTheme()

  // ------------------ METHODS ------------------

  const [isSelect, setIsSelect] = useState(false)

  const onClose = () => setIsSelect(false)

  const setChain = (value: { alias: string; name: string }) => {
    onChange([value])
    setIsSelect(false)
  }

  const findChain = (al: string) => {
    return CHAIN_LIST.find((c) => c.alias === al)
  }

  // ------------------ COMPUTED ------------------

  // ------------------ RENDER ------------------

  return (
    <View>
      <TouchableOpacity onPress={() => setIsSelect(true)}>
        <View style={styles.flex}>
          <View style={styles.content}>
            <Text preset="label" size="sm" tx={"crypto_asset:network"} style={styles.mb5} />
            <View style={styles.row}>
              {selected.length ? (
                selected.map((item) => {
                  const selectedChain = findChain(item.alias)
                  return (
                    <View key={item.alias} style={styles.row}>
                      <Image
                        resizeMode="contain"
                        source={selectedChain?.logo || chainOther}
                        style={styles.image}
                      />

                      <Text preset="bold" text={item.name} />
                    </View>
                  )
                })
              ) : (
                <Text tx={"common:none"} />
              )}
            </View>
          </View>
          <Icon icon="caret-right" size={20} color={colors.title} />
        </View>
      </TouchableOpacity>
      <WalletChainsModal isOpen={isSelect} onClose={onClose} chain={selected} setChain={setChain} />
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  flex: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  image: {
    borderRadius: 20,
    height: 32,
    marginRight: 8,
    width: 32,
  },
  mb5: {
    marginBottom: 5,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
