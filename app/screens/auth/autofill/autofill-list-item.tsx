import React, { memo } from "react"
import { NativeModules, View } from "react-native"
import { useMixins } from "../../../services/mixins"
import { commonStyles, fontSize } from "../../../theme"
import { useCipherHelpersMixins } from "../../../services/mixins/cipher/helpers"
import { Checkbox } from "react-native-ui-lib"
import MaterialCommunityIconsIcon from "react-native-vector-icons/MaterialCommunityIcons"
import IoniconsIcon from "react-native-vector-icons/Ionicons"
import isEqual from "lodash/isEqual"
import { Button, AutoImage as Image, Text } from "../../../components"
import { CipherView } from "../../../../core/models/view"
import { getTOTP, parseOTPUri } from "../../../utils/totp"

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
    const { color, copyToClipboard } = useMixins()
    const { getCipherDescription } = useCipherHelpersMixins()

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
      <Button
        preset="link"
        onPress={() => {
          if (isSelecting) {
            toggleItemSelection(item.id)
          } else {
            selectForAutoFill(item)
            if (item.login.hasTotp) {
              const otp = getTOTP(parseOTPUri(item.login.totp))
              console.log(otp)
              copyToClipboard(otp)
            }
          }
        }}
        onLongPress={() => toggleItemSelection(item.id)}
        style={{
          borderBottomColor: color.line,
          borderBottomWidth: 0.5,
          paddingVertical: 15,
          height: 70.5,
        }}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          {item.svg ? (
            <item.svg height={40} width={40} />
          ) : (
            <Image
              source={item.imgLogo || item.logo}
              backupSource={item.logo}
              style={{
                height: 40,
                width: 40,
                borderRadius: 8,
              }}
            />
          )}

          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={[commonStyles.CENTER_HORIZONTAL_VIEW]}>
              <View style={{ flex: 1 }}>
                <Text preset="semibold" numberOfLines={1} text={item.name} />
              </View>

              {item.organizationId && (
                <View style={{ marginLeft: 10 }}>
                  <MaterialCommunityIconsIcon
                    name="account-group-outline"
                    size={22}
                    color={color.textBlack}
                  />
                </View>
              )}

              {item.notSync && (
                <View style={{ marginLeft: 10 }}>
                  <MaterialCommunityIconsIcon
                    name="cloud-off-outline"
                    size={22}
                    color={color.textBlack}
                  />
                </View>
              )}
            </View>

            {!!getCipherDescription(item) && (
              <Text
                text={getCipherDescription(item)}
                style={{ fontSize: fontSize.small }}
                numberOfLines={1}
              />
            )}
          </View>

          {isSelecting ? (
            <Checkbox
              value={isSelected}
              color={color.primary}
              onValueChange={() => {
                toggleItemSelection(item)
              }}
            />
          ) : (
            <Button
              preset="link"
              onPress={() => openActionMenu(item)}
              style={{ height: 40, alignItems: "center" }}
            >
              <IoniconsIcon name="ellipsis-horizontal" size={18} color={color.textBlack} />
            </Button>
          )}
        </View>
      </Button>
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
