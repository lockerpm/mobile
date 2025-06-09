import { VAULT_LOGO } from "app/static/vault"
import { CipherType } from "core/enums"
import React, { useEffect, useState } from "react"
import { ImageProps, Image, ImageStyle } from "react-native"

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

export const CipherIconImage = ({
  cipherType,
  source,
  style,
  ...otherProps
}: ImageProps & { cipherType: CipherType }) => {
  const [imageSource, setImageSource] = useState(source)

  useEffect(() => {
    setImageSource(source)
  }, [source])
  return (
    <Image
      source={imageSource}
      resizeMode="contain"
      onError={() => {
        setImageSource(getDefaultLogo(cipherType))
      }}
      style={[$imageStyle, style]}
      {...otherProps}
    />
  )
}

const $imageStyle: ImageStyle = {
  width: 40,
  height: 40,
  borderRadius: 8,
}
