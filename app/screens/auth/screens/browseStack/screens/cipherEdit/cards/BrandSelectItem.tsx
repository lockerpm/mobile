import { useState } from "react"
import { View, TouchableOpacity, StyleSheet, ViewStyle, Image } from "react-native"
import { Text, Icon } from "app/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"
import { BrandsModal } from "./BrandsModal"
import { ThemedStyle } from "@/theme"
import { CARD_BRANDS } from "@/static/constants"

interface Props {
  brand: string
  setBrand: (val: string) => void
}

export const BrandSelectItem = ({ brand, setBrand }: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const [isOpen, setIsOpen] = useState(false)

  const onClose = () => setIsOpen(false)

  const handleSelect = (code: string) => {
    setBrand(code)
    onClose()
  }
  const item = CARD_BRANDS.find((b) => b.value === brand) || CARD_BRANDS[CARD_BRANDS.length - 1]

  return (
    <View>
      <TouchableOpacity onPress={() => setIsOpen(true)} style={themed($container)}>
        <View style={styles.row}>
          <View>
            {!brand && <Text preset="label" size="sm" tx="card:brand" />}

            {!!brand && (
              <View style={styles.row2}>
                <Image source={item.logo} style={styles.logo} />
                <Text preset="bold" text={brand} />
              </View>
            )}
          </View>
          <Icon icon="caret-right" size={20} color={colors.label} />
        </View>
      </TouchableOpacity>

      <BrandsModal isOpen={isOpen} onClose={onClose} brand={brand} setBrand={handleSelect} />
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  marginTop: 24,
})

const styles = StyleSheet.create({
  logo: {
    borderRadius: 8,
    height: 32,
    marginRight: 12,
    width: 32,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  row2: {
    alignItems: "center",
    flexDirection: "row",
  },
})
