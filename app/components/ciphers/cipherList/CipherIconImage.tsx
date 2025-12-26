import { useState } from "react"
import { ImageProps, Image, ImageStyle, View } from "react-native"

import { VAULT_LOGO } from "app/static/vault"
import { CipherType } from "core/enums"

import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

const getDefaultLogo = (type: CipherType) => {
  switch (type) {
    case CipherType.MasterPassword:
    case CipherType.Login: {
      return VAULT_LOGO.passwords
    }
    case CipherType.Card:
      return VAULT_LOGO.cards

    case CipherType.Identity:
      return VAULT_LOGO.identities
    case CipherType.SecureNote:
      return VAULT_LOGO.notes
    case CipherType.CryptoWallet: {
      return VAULT_LOGO.cryptoWallets
    }
  }
  return VAULT_LOGO.passwords
}

const KEY = require("assets/icons/key.fill.png")

export const CipherIconImage = ({
  cipherType,
  source,
  style,
  isHaveKey,
  ...otherProps
}: ImageProps & { cipherType: CipherType; isHaveKey?: boolean }) => {
  const { themed } = useAppTheme()
  const [imageSource, setImageSource] = useState(source)

  return (
    <View style={[style, $center]}>
      <Image
        source={imageSource}
        resizeMode="contain"
        onError={() => {
          setImageSource(getDefaultLogo(cipherType))
        }}
        style={$imageStyle}
        {...otherProps}
      />
      {isHaveKey && (
        <View style={themed($keyContainerStyle)}>
          <Image source={KEY} resizeMode="contain" style={themed($keyStyle)} />
        </View>
      )}
    </View>
  )
}

const $center: ImageStyle = {
  justifyContent: "center",
  alignItems: "center",
}

const $imageStyle: ImageStyle = {
  width: 40,
  height: 40,
  borderRadius: 8,
}

const $keyStyle: ThemedStyle<ImageStyle> = ({ colors }) => ({
  width: 18,
  height: 18,
  tintColor: colors.text,
})

const $keyContainerStyle: ThemedStyle<ImageStyle> = ({ colors }) => ({
  position: "absolute",
  padding: 2,
  width: 26,
  height: 26,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 15,
  backgroundColor: colors.block,
  borderColor: colors.background,
  borderWidth: 1,
  bottom: -8,
  right: -8,
})
