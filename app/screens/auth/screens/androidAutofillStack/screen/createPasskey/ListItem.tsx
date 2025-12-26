import { memo } from "react"
import { StyleSheet, View } from "react-native"

import { CipherIconImage } from "app/components/ciphers/cipherList/CipherIconImage"
import { Icon, PressableScale, Text } from "app/components/cores"
import { CipherType } from "core/enums"

import { CipherAppView } from "@/static/types"
import { useAppTheme } from "@/utils/useAppTheme"

type Prop = {
  item: CipherAppView
  onPress: (val: CipherAppView) => void
}

export const LoginPasskeyListItem = memo(({ item, onPress }: Prop) => {
  const {
    theme: { colors },
  } = useAppTheme()
  return (
    <PressableScale
      onPress={() => {
        onPress(item)
      }}
      style={[styles.container, { backgroundColor: colors.block }]}
    >
      <View style={styles.row}>
        <CipherIconImage
          isHaveKey={item.login.hasFido2Credentials}
          resizeMode="contain"
          source={item.imgLogo}
          cipherType={CipherType.Login}
        />

        <View style={styles.content}>
          <Text preset="bold" numberOfLines={1} text={item.login.username} />
          <Text preset="label" size="sm" text={item.name} numberOfLines={1} />
        </View>
        {item.organizationId && <Icon icon="users-three" size={22} containerStyle={styles.ml10} />}
      </View>
    </PressableScale>
  )
})

LoginPasskeyListItem.displayName = "LoginPasskeyListItem"

const styles = StyleSheet.create({
  container: {
    height: 71,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 12,
  },
  ml10: {
    marginLeft: 10,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
