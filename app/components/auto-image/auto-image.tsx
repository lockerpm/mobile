import React, { useLayoutEffect, useState } from "react"
import {
  Image as RNImage,
  ImageProps as DefaultImageProps,
  ImageURISource,
} from "react-native"

type ImageProps = DefaultImageProps & {
  source: ImageURISource,

  // Only local image pls
  backupSource?: ImageURISource
}

export function AutoImage(props: ImageProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [layoutWidth, setLayoutWidth] = useState(0)
  const [useBackup, setUseBackup] = useState(false)

  useLayoutEffect(() => {
    let mounted = true

    if (props.source?.uri) {
      RNImage.getSize(props.source.uri as any, (width, height) => {
        if (mounted) {
          if (layoutWidth) {
            setImageSize({
              width: layoutWidth,
              height: height * (layoutWidth / width)
            })
          } else {
            setImageSize({ width, height })
          }
        }
      }, (err) => {
        // Use backup in case of get image from uri failed
        if (props.backupSource && !props.backupSource.uri) {
          const { width, height } = RNImage.resolveAssetSource(props.backupSource)
          if (mounted) {
            if (layoutWidth) {
              setImageSize({
                width: layoutWidth,
                height: height * (layoutWidth / width)
              })
            } else {
              setImageSize({ width, height })
            }
          }
          setUseBackup(true)
        }
      })
    } else {
      // Use backup in case of { uri: null }
      if (props.source?.uri === null && props.backupSource && !props.backupSource.uri) {
        const { width, height } = RNImage.resolveAssetSource(props.backupSource)
        if (mounted) {
          if (layoutWidth) {
            setImageSize({
              width: layoutWidth,
              height: height * (layoutWidth / width)
            })
          } else {
            setImageSize({ width, height })
          }
        }
        setUseBackup(true)
      } else {
        const { width, height } = RNImage.resolveAssetSource(props.source)
        if (mounted) {
          if (layoutWidth) {
            setImageSize({
              width: layoutWidth,
              height: height * (layoutWidth / width)
            })
          } else {
            setImageSize({ width, height })
          }
        }
      }
    }

    return () => {
      mounted = false
    }
  }, [props.source])

  return (
    <RNImage
      resizeMode="contain"
      {...props} 
      source={useBackup ? props.backupSource : props.source} 
      style={[imageSize, props.style]}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width
        setLayoutWidth(w)
        const { width, height } = imageSize
        if (width && height) {
          setImageSize({
            width: w,
            height: height * (w / width)
          })
        }
      }}

    />
  )
}
