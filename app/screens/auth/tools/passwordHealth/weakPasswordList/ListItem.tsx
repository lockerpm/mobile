import React, { memo } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import isEqual from 'lodash/isEqual'
import { Text } from 'app/components/cores'
import { useTheme } from 'app/services/context'
import { useCipherHelper } from 'app/services/hook'
import { PasswordStrength } from 'app/components/utils'

type Prop = {
  item: any
  goToDetail: (val: any) => void
}

export const ListItem = memo(
  (props: Prop) => {
    const { item, goToDetail } = props
    const { colors } = useTheme()
    const { getCipherDescription } = useCipherHelper()

    return (
      <TouchableOpacity
        onPress={() => goToDetail(item)}
        style={{
          borderBottomColor: colors.border,
          borderBottomWidth: 0.5,
          paddingVertical: 15,
          height: 70.5,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={item.imgLogo}
            style={{
              height: 40,
              width: 40,
              borderRadius: 8,
            }}
          />

          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text
                  preset="bold"
                  text={item.name}
                  numberOfLines={1}
                  style={{
                    marginRight: 7,
                  }}
                />
              </View>

              <View
                style={{
                  paddingBottom: 4,
                }}
              >
                <PasswordStrength preset="text" value={item.strength} />
              </View>
            </View>

            {!!getCipherDescription(item) && (
              <Text
                preset="label"
                text={getCipherDescription(item)}
                style={{ fontSize: 14 }}
                numberOfLines={1}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  },
  (prev, next) => {
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
  }
)
