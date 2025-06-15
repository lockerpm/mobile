import React, { memo } from "react"
import { TouchableOpacity, View } from "react-native"
import { Icon, Text } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"

import { IS_IOS } from "app/config/constants"
import { getCipherDescription } from "app/utils/cipherHelper"
import { CipherIconImage } from "app/components/newCiphers"

type Prop = {
  item: any
  goToDetail: (val: any) => void
}

export const ListItem = memo(
  (props: Prop) => {
    const { item, goToDetail } = props
    const { colors } = useTheme()
    const { translate } = useAppLocale()

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
            cipherType={item.type}
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
  () => true,
)
