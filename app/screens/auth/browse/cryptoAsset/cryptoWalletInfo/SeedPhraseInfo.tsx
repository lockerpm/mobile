import React, { useState } from "react"
import { Text, Icon } from "app/components-v2/cores"
import { View } from "react-native"
import { SeedPhraseInput } from "../cryptoWalletEdit/seed-phrase-input"
import { useHelper } from "app/services/hook"
import { translate } from "app/i18n"

interface Props {
  seed: string
}
export const SeedPhraseInfo = (props: Props) => {
  const { copyToClipboard } = useHelper()

  const [showPassword, setShowPassword] = useState(false)

  return (
    <View>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4
      }}>
        <Text
          preset="label"
          text={translate('crypto_asset.seed')}
        />
        <View style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <Icon
            icon={showPassword ? "eye-slash" : "eye"}
            size={18}
            onPress={() => {
              setShowPassword(!showPassword)
            }}
          />

          <Icon
            icon="copy"
            size={17}
            onPress={() => {
              copyToClipboard(props.seed)
            }}
          />
        </View>
      </View>

      <SeedPhraseInput
        seed={props.seed}
        hideSeedPhrase={!showPassword}
        disableEdit={true}
      />
    </View>
  )
}