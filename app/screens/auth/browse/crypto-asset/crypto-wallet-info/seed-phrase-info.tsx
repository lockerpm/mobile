import React, { useState } from "react"
import { Button, Text } from "../../../../../components"
import Icon from 'react-native-vector-icons/FontAwesome'
import { View, ViewStyle } from "react-native"
import { useMixins } from "../../../../../services/mixins"
import { fontSize } from "../../../../../theme"
import { SeedPhraseInput } from "../crypto-wallet-edit/seed-phrase-input"

interface Props {
  seed: string
}
export const SeedPhraseInfo = (props: Props) => {
  const { translate, color, copyToClipboard } = useMixins()

  const [showPassword, setShowPassword] = useState(false)

  const BUTTON_CONTAINER: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center'
  }

  const BUTTON: ViewStyle = {
    alignItems: 'center',
    width: 35,
    height: 30
  }

  return (
    <View>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4
      }}>
        <Text
          text={translate('crypto_asset.seed')}
          style={{ fontSize: fontSize.p }}
        />
        <View style={BUTTON_CONTAINER}>
          <Button
            preset="link"
            onPress={() => {
              setShowPassword(!showPassword)
            }}
            style={BUTTON}
          >
            <Icon
              name={"eye"}
              size={18}
              color={color.text}
            />
          </Button>
          <Button
            preset="link"
            onPress={() => {
              copyToClipboard(props.seed)
            }}
            style={BUTTON}
          >
            <Icon
              name="copy"
              size={17}
              color={color.text}
            />
          </Button>

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