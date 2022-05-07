import React, { memo } from "react"
import { View } from "react-native"
import isEqual from 'lodash/isEqual'
import { Button, AutoImage as Image, Text, PasswordStrength } from "../../../../../components"
import { useMixins } from "../../../../../services/mixins"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"
import { commonStyles, fontSize } from "../../../../../theme"


type Prop = {
  item: any
  goToDetail: (val: any) => void
}

export const ListItem = memo((props: Prop) => {
  const { item, goToDetail } = props
  const { color } = useMixins()
  const { getCipherDescription } = useCipherHelpersMixins()

  return (
    <Button
      preset="link"
      onPress={() => goToDetail(item)}
      style={{
        borderBottomColor: color.line,
        borderBottomWidth: 0.5,
        paddingVertical: 15,
        height: 70.5
      }}
    >
      <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
        <Image
          source={item.imgLogo || item.logo}
          backupSource={item.logo}
          style={{
            height: 40,
            width: 40,
            borderRadius: 8
          }}
        />

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={[commonStyles.CENTER_HORIZONTAL_VIEW]}>
            <View style={{ flex: 1 }}>
              <Text
                preset="semibold"
                text={item.name}
                numberOfLines={1}
                style={{
                  marginRight: 7
                }}
              />
            </View>

            <View style={{
              paddingBottom: 4
            }}>
              <PasswordStrength
                preset="text"
                value={item.strength}
              />
            </View>
          </View>

          {
            !!getCipherDescription(item) && (
              <Text
                text={getCipherDescription(item)}
                style={{ fontSize: fontSize.small }}
                numberOfLines={1}
              />
            )
          }
        </View>
      </View>
    </Button>
  )
}, (prev, next) => {
  const whitelist = ['goToDetail']
  const prevProps = Object.keys(prev)
  const nextProps = Object.keys(next)
  if (!isEqual(prevProps, nextProps)) {
    return false
  }
  const isPropsEqual = prevProps.reduce((val, key) => {
    if (whitelist.includes(key)) {
      return val
    }
    return val && isEqual(prev[key], next[key])
  }, true)
  return isPropsEqual
})
