import { memo } from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { Text } from "app/components/cores"
import { PasswordStrength } from "app/components/utils"
import { getCipherDescription } from "app/utils/cipherHelper"
import { CipherIconImage } from "app/components/ciphers"
import { CipherAppView } from "@/static/types"

export type WeakPasswordView = CipherAppView & {
  strength: number
}
type Prop = {
  item: WeakPasswordView
  goToDetail: (val: CipherAppView) => void
}

export const ListItem = memo(
  (props: Prop) => {
    const { item, goToDetail } = props
    const des = getCipherDescription(item)

    return (
      <TouchableOpacity onPress={() => goToDetail(item)} style={styles.container}>
        <View style={styles.row}>
          <CipherIconImage
            isHaveKey={item.login.hasFido2Credentials}
            cipherType={item.type}
            source={item.imgLogo}
            style={styles.logo}
          />

          <View style={styles.content}>
            <View style={styles.row}>
              <Text preset="bold" text={item.name} numberOfLines={1} style={styles.name} />

              <PasswordStrength preset="text" value={item.strength} />
            </View>

            {!!des && <Text preset="label" text={des} size="sm" numberOfLines={1} />}
          </View>
        </View>
      </TouchableOpacity>
    )
  },
  () => true
)

ListItem.displayName = "WeakPasswordListItem"

const styles = StyleSheet.create({
  container: {
    height: 71,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  logo: {
    borderRadius: 8,
    height: 40,
    width: 40,
  },
  name: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 8,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
