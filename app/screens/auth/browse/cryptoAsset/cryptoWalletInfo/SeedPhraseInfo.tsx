import React, { useState } from 'react'
import { Text, Icon } from 'app/components/cores'
import { View } from 'react-native'
import { SeedPhraseInput } from '../cryptoWalletEdit/SeedPhraseInput'
import { useHelper } from 'app/services/hook'
import { translate } from 'app/i18n'

interface Props {
  seed: string
}
export const SeedPhraseInfo = (props: Props) => {
  const { copyToClipboard } = useHelper()

  const [showPassword, setShowPassword] = useState(false)

  return (
    <View style={{
      marginTop: 16
    }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <Text preset="label" text={translate('crypto_asset.seed')} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 14
          }}
        >
          <Icon
            icon={showPassword ? 'eye-slash' : 'eye'}
            size={20}
            onPress={() => {
              setShowPassword(!showPassword)
            }}
            containerStyle={{ marginRight: 16 }}
          />

          <Icon
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
