import { memo } from "react"
import { ImageSourcePropType, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"

import { Icon, Text } from "app/components/cores"
import { SharingStatus } from "app/static/types"
import { CipherType } from "core/enums"

import { CipherIconImage } from "@/components/ciphers"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

type Prop = {
  hasFido2Credentials: boolean
  cipherType: CipherType
  imgLogo: ImageSourcePropType
  name: string
  description?: string
}

export const YourShareCipherItem = memo((item: Prop) => {
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
})

YourShareCipherItem.displayName = "YourShareCipherItem"

const styles = StyleSheet.create({
  acceptContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
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
  flex: {
    flex: 1,
  },
  ml8: {
    marginLeft: 8,
  },
  name: {
    flexGrow: 1,
    flexShrink: 1,
  },
  notSync: {
    marginLeft: 10,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  status: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  status2: {
    alignItems: "center",
    borderRadius: 6,
    flexDirection: "row",
    marginLeft: 10,
    paddingHorizontal: 10,
  },
})
