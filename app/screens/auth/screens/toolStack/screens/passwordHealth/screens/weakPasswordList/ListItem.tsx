import React, { memo } from "react"
import { View, TouchableOpacity } from "react-native"
import { Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import { PasswordStrength } from "app/components/utils"
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
                <Text
                  preset="bold"
                  text={item.name}
                  numberOfLines={1}
                  style={{
                    marginRight: 7,
                  }}
                />
              </View>

              <View>
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
  () => true,
)
