import { ImageSourcePropType, StyleSheet, View } from "react-native"

import { Text } from "app/components/cores"
import { CipherType } from "core/enums"

import { CipherIconImage } from "@/components/ciphers"

type Prop = {
  hasFido2Credentials: boolean
  cipherType: CipherType
  imgLogo: ImageSourcePropType
  name: string
  description?: string
}

export const YourShareCipherItemInfo = (item: Prop) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <CipherIconImage
          isHaveKey={item.hasFido2Credentials}
          cipherType={item.cipherType}
          source={item.imgLogo}
        />

        <View style={styles.content2}>
          <View style={styles.row}>
            <Text preset="bold" text={item.name} numberOfLines={1} style={styles.name} />
          </View>

          {!!item.description && (
            <Text preset="label" size="xs" text={item.description} numberOfLines={2} />
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: 71,
    paddingVertical: 12,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
  },
  content2: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    flexGrow: 1,
    flexShrink: 1,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
