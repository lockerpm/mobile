import React, { memo } from "react"
import { View } from "react-native"
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import isEqual from 'lodash/isEqual'
import { Button, AutoImage as Image, Text } from "../../../../../components"
import { useMixins } from "../../../../../services/mixins"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"
import { commonStyles, fontSize } from "../../../../../theme"


type Prop = {
  item: any
  goToDetail: (val: any) => void
}

export const ListItem = memo((props: Prop) => {
  const { item, goToDetail } = props
  const { color, translate } = useMixins()
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
              />
            </View>

            {
              item.organizationId && (
                <View style={{ marginLeft: 10 }}>
                  <MaterialCommunityIconsIcon
                    name="account-group-outline"
                    size={22}
                    color={color.textBlack}
                  />
                </View>
              )
            }

            <View style={{
                paddingHorizontal: 10,
                paddingVertical: 2,
                backgroundColor: color.warning,
                borderRadius: 3,
                marginLeft: 7
              }}>
                <Text
                  text={`${item.count} ${translate('common.times')}`}
                  style={{
                    fontWeight: 'bold',
                    color: color.white,
                    fontSize: fontSize.mini
                  }}
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
