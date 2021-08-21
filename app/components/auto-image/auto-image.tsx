import React, { useLayoutEffect, useState } from "react"
import {
  Image as RNImage,
  ImageProps as DefaultImageProps,
  ImageURISource,
  Platform,
} from "react-native"

type ImageProps = DefaultImageProps & {
  source: ImageURISource,

  // Only local image pls
  backupSource?: ImageURISource
}

export function AutoImage(props: ImageProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [useBackup, setUseBackup] = useState(false)

  useLayoutEffect(() => {
    if (props.source?.uri) {
      RNImage.getSize(props.source.uri as any, (width, height) => {
        setImageSize({ width, height })
      }, (err) => {
        if (props.backupSource && !props.backupSource.uri) {
          const { width, height } = RNImage.resolveAssetSource(props.backupSource)
          setImageSize({ width, height })
          setUseBackup(true)
        }
      })
    } else if (Platform.OS === "web") {
      // web requires a different method to get it's size
      RNImage.getSize(props.source as any, (width, height) => {
        setImageSize({ width, height })
      }, (err) => {
        if (props.backupSource && !props.backupSource.uri) {
          const { width, height } = RNImage.resolveAssetSource(props.backupSource)
          setImageSize({ width, height })
          setUseBackup(true)
        }
      })
    } else {
      const { width, height } = RNImage.resolveAssetSource(props.source)
      setImageSize({ width, height })
    }
  }, [])

  return (
    <RNImage 
      {...props} 
      source={useBackup ? props.backupSource : props.source} 
      style={[imageSize, props.style]} 
    />
  )
}
