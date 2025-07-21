import { useState } from "react"
import { Text, PressableIcon } from "app/components/cores"
import { StyleSheet, View } from "react-native"
import { useClipboard } from "app/services/utils"
import { SeedPhraseInput } from "app/components/ciphers"

interface Props {
  seed: string
}
export const SeedPhraseInfo = (props: Props) => {
  const { copyToClipboard } = useClipboard()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View style={styles.mt16}>
      <View style={styles.content}>
        <Text preset="label" tx={"crypto_asset:seed"} />
        <View style={styles.action}>
          <PressableIcon
            icon={showPassword ? "eye-slash" : "eye"}
            size={20}
            onPress={() => {
              setShowPassword(!showPassword)
            }}
            containerStyle={styles.mr16}
          />

          <PressableIcon
            icon="copy"
            size={20}
            onPress={() => {
              copyToClipboard(props.seed)
            }}
          />
        </View>
      </View>

      <SeedPhraseInput seed={props.seed} hideSeedPhrase={!showPassword} disableEdit={true} />
    </View>
  )
}

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    flexDirection: "row",
    paddingRight: 14,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  mr16: {
    marginRight: 16,
  },
  mt16: {
    marginTop: 16,
  },
})
