import React, { memo } from "react"
import { NativeModules, TouchableOpacity, View, Image } from "react-native"
import isEqual from "lodash/isEqual"
import { Icon, Text, Toggle } from "app/components/cores"
import { useCipherHelper, useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { CipherView } from "core/models/view"
import { getTOTP, parseOTPUri } from "app/utils/totp"

const { RNAutofillServiceAndroid } = NativeModules

type Prop = {
  item: any
  isSelecting: boolean
  toggleItemSelection: (id: string) => void
  openActionMenu: (val: any) => void
  isSelected: boolean
}

export const AutofillListItem = memo(
  (props: Prop) => {
    const { item, isSelecting, toggleItemSelection, openActionMenu, isSelected } = props
    const { colors } = useTheme()
    const { copyToClipboard } = useHelper()
    const { getCipherDescription } = useCipherHelper()

    const selectForAutoFill = (item: CipherView) => {
      RNAutofillServiceAndroid.addAutofillValue(
        item.id,
        item.login.username,
        item.login.password,
        item.name,
        item.login.uri,
      )
    }

    return (
      <TouchableOpacity
        onPress={() => {
          if (isSelecting) {
            toggleItemSelection(item.id)
          } else {
            selectForAutoFill(item)
            if (item.login.hasTotp) {
              const otp = getTOTP(parseOTPUri(item.login.totp))
              copyToClipboard(otp)
            }
          }
        }}
        onLongPress={() => toggleItemSelection(item.id)}
        style={{
          borderBottomColor: colors.border,
          borderBottomWidth: 0.5,
          paddingVertical: 15,
          height: 70.5,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={item.imgLogo}
            style={{
              height: 40,
              width: 40,
              borderRadius: 8,
            }}
          />

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text preset="bold" numberOfLines={1} text={item.name} style={{ maxWidth: "80%" }} />

            {!!getCipherDescription(item) && (
              <Text
                preset="label"
                text={getCipherDescription(item)}
                style={{ fontSize: 14 }}
                numberOfLines={1}
              />
            )}
          </View>
          {item.organizationId && (
            <Icon icon="users-three" size={22} containerStyle={{ marginLeft: 10 }} />
          )}

          {item.notSync && <Icon icon="wifi-slash" size={22} containerStyle={{ marginLeft: 10 }} />}

          {isSelecting ? (
            <Toggle
              variant="checkbox"
              value={isSelected}
              onValueChange={() => {
                toggleItemSelection(item)
              }}
            />
          ) : (
            <Icon icon="dots-three" size={18} onPress={() => openActionMenu(item)} />
          )}
        </View>
      </TouchableOpacity>
    )
  },
  (prev, next) => {
    const whitelist = ["toggleItemSelection", "openActionMenu"]
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
