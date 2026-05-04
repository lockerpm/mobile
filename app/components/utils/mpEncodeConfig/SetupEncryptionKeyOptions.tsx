import { View, StyleSheet, StyleProp, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { Text } from "app/components/cores"
import { KdfType } from "core/enums/kdfType"

import { AppScreenProps } from "@/navigators"
import { MPEncodeConfig } from "@/static/types"
import { useAppTheme } from "@/utils/useAppTheme"

type Props = {
  keyConfig: MPEncodeConfig
  style?: StyleProp<ViewStyle>
}

const ALGORITHM_OPTIONS = [
  { label: "PBKDF2", value: KdfType.PBKDF2_SHA256 },
  { label: "Argon2id", value: KdfType.ARGON2ID },
]

export const SetupEncryptionKeyOptions = ({ keyConfig, style }: Props) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const navigation = useNavigation<AppScreenProps<"init">["navigation"]>()

  const openConfig = () => {
    navigation.navigate("encryptionConfigModal", {
      data: keyConfig,
    })
  }

  return (
    <View style={[styles.container, style]}>
      <Text>
        <Text size="xs" tx="encryption_key:encryption_alg" />
        <Text
          text={
            ALGORITHM_OPTIONS.find((option) => option.value === keyConfig.kdf)?.label || "PBKDF2"
          }
        />
      </Text>
      <Text tx="common:edit" color={colors.primary} onPress={openConfig} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
})
