import { CHAIN_LIST } from "app/utils/crypto/chainlist"
import { useCallback, useState } from "react"
import { View, StyleSheet, Image, ViewStyle } from "react-native"
import { Icon, PressableIcon, PressableScale, Text } from "app/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"
import { WalletChainsModal } from "./WalletChainsModal"
import { CipherEditActionField } from "@/components/ciphers"
import { ThemedStyle } from "@/theme"

type Props = {
  selected: {
    alias: string
    name: string
  }[]
  onChange: (items: { alias: string; name: string }[]) => void
}

const chainOther = require("assets/images/icons/crypto/other.png")
const findChain = (al: string) => {
  return CHAIN_LIST.find((c) => c.alias === al)
}

export const ChainSelect = (props: Props) => {
  const { onChange, selected } = props
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  // ------------------ METHODS ------------------

  const [isSelect, setIsSelect] = useState(false)

  const onClose = () => setIsSelect(false)

  const setChain = (value: { alias: string; name: string }) => {
    onChange([...selected, value])
    setIsSelect(false)
  }

  const removeChain = (value: { alias: string; name: string }) => {
    onChange(selected.filter((c) => c.alias !== value.alias))
  }

  // ------------------ COMPUTED ------------------

  const showModal = useCallback(() => {
    setIsSelect(true)
  }, [])
  // ------------------ RENDER ------------------

  return (
    <View>
      {(!selected || selected.length === 0) && (
        <CipherEditActionField labelTx="crypto_asset:network" onPress={showModal} />
      )}

      {selected.length > 0 && (
        <>
          <Text
            weight="medium"
            color={colors.text}
            tx={"crypto_asset:network"}
            style={[styles.label, { backgroundColor: colors.background }]}
          />
          <View style={themed($container)}>
            {selected.map((item, index) => (
              <View key={index}>
                {index !== 0 && <View style={themed($divider)} />}
                <ChainItem
                  item={item}
                  onRemove={() => {
                    removeChain(item)
                  }}
                />
              </View>
            ))}
          </View>
          <PressableScale style={styles.add} onPress={showModal}>
            <Text
              preset="bold"
              tx="password:addWebsite"
              color={colors.primary}
              style={styles.mr8}
            />
            <Icon icon="plus-circle" size={18} color={colors.primary} />
          </PressableScale>
        </>
      )}

      <WalletChainsModal isOpen={isSelect} onClose={onClose} chain={selected} setChain={setChain} />
    </View>
  )
}

const ChainItem = ({
  item,
  onRemove,
}: {
  item: { alias: string; name: string }
  onRemove: () => void
}) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const selectedChain = findChain(item.alias)

  return (
    <View style={styles.chainItem}>
      <View style={styles.row}>
        <Image
          resizeMode="contain"
          source={selectedChain?.logo || chainOther}
          style={styles.image}
        />
        <Text text={item.name} />
      </View>
      <PressableIcon icon="trash" size={18} color={colors.error} onPress={onRemove} />
    </View>
  )
}

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  width: "100%",
  backgroundColor: colors.border,
})

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: "100%",
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
})

const styles = StyleSheet.create({
  add: {
    alignItems: "center",
    alignSelf: "flex-end",
    flexDirection: "row",
    marginBottom: -12,
    paddingVertical: 12,
  },
  chainItem: {
    alignItems: "center",
    flexDirection: "row",
    height: 48,
    justifyContent: "flex-start",
    paddingHorizontal: 12,
  },
  image: {
    borderRadius: 20,
    height: 24,
    marginRight: 12,
    width: 24,
  },
  label: {
    left: 0,
    paddingHorizontal: 4,
    position: "absolute",
    top: -14,
    transform: [{ scale: 0.9 }],
    zIndex: 5,
  },
  mr8: {
    marginRight: 8,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
  },
})
