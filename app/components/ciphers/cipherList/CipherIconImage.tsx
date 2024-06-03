import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import React, { useEffect, useState } from "react"
import { ImageProps, Image } from "react-native"

export const CipherIconImage = ({ source, ...otherProps }: ImageProps) => {
  const [imageSource, setImageSource] = useState(source)

  useEffect(() => {
    setImageSource(source)
  }, [source])
  return (
    <Image
      source={imageSource}
      resizeMode="contain"
      onError={() => {
        setImageSource(BROWSE_ITEMS.password.icon)
      }}
      {...otherProps}
    />
  )
}
