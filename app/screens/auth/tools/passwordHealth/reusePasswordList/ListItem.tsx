import React, { memo } from "react"
import { TouchableOpacity, View } from "react-native"
import isEqual from "lodash/isEqual"
import { Icon, Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import { useCipherHelper, useHelper } from "app/services/hook"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { CipherIconImage } from "app/components/ciphers/cipherList/CipherIconImage"
import { IS_IOS } from "app/config/constants"

type Prop = {
  item: any
  goToDetail: (val: any) => void
}

export const ListItem = memo(
  (props: Prop) => {
    const { item, goToDetail } = props
    const { colors } = useTheme()
    const { translate } = useHelper()
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <CipherIconImage
            defaultSource={IS_IOS ? BROWSE_ITEMS.password.icon : undefined}
            source={item.imgLogo}
            style={{
              height: 40,
              width: 40,
              borderRadius: 8,
            }}
          />

          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text preset="bold" text={item.name} numberOfLines={1} />
              </View>

              {item.organizationId && (
                <View style={{ marginLeft: 10 }}>
                  <Icon icon="users-three" size={22} />
                </View>
              )}

              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 2,
                  backgroundColor: colors.warning,
                  borderRadius: 3,
                  marginLeft: 7,
                }}
              >
                <Text
                  text={`${item.count} ${translate("common.times")}`}
                  style={{
                    fontWeight: "bold",
                    color: colors.white,
                    fontSize: 12,
                  }}
                />
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
    const whitelist = ["goToDetail"]
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
  },
)
