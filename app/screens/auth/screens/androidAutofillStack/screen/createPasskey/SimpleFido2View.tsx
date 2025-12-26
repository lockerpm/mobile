import { Image, StyleSheet, View } from "react-native"

import { Text } from "@/components/cores"
import Config from "@/config"
import { useAppTheme } from "@/utils/useAppTheme"

type Props = {
  rpId: string
  userName: string
}
export const SimpleFido2View = ({ rpId, userName }: Props) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const imgUri = `${Config.GET_LOGO_URL}/${rpId}?size=120`
  return (
    <View style={styles.paddingHorizontal16}>
      <Text preset="label" tx="autofill_service:android_service.create_passkey.existing_key" />
      <View style={[styles.container, { backgroundColor: colors.block }]}>
        <Image source={{ uri: imgUri }} style={styles.image} />
        <Text text={userName} style={styles.text} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  image: {
    borderRadius: 8,
    height: 40,
    width: 40,
  },
  paddingHorizontal16: {
    paddingHorizontal: 16,
  },
  text: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 12,
  },
})
