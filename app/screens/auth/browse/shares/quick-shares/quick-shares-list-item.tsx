import React, { memo } from "react"
import { View } from "react-native"
// import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import isEqual from "lodash/isEqual"
import { useMixins } from "../../../../../services/mixins"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"
import { Button, Text, AutoImage as Image } from "../../../../../components"
import { commonStyles, fontSize } from "../../../../../theme"
import { SendView } from "../../../../../../core/models/view/sendView"
import moment from "moment"

type Prop = {
  item: SendView
  openActionMenu: (val: any) => void
}

export const QuickSharesCipherListItem = memo(
  (props: Prop) => {
    const { openActionMenu, item } = props
    const { color, translate } = useMixins()
    const { getCipherInfo } = useCipherHelpersMixins()

    const cipherInfo = getCipherInfo(item.cipher)

    const cipher = {
      ...item.cipher,
      logo: cipherInfo.backup,
      imgLogo: cipherInfo.img,
      svg: cipherInfo.svg,
    }
    const description = moment.unix(item.creationDate.getTime() / 1000).fromNow()

    const isExpired = item.expirationDate?.getTime() < Date.now()
    return (
      <Button
        preset="link"
        onPress={() => {
          openActionMenu(item)
        }}
        style={{
          borderBottomColor: color.line,
          borderBottomWidth: 0.5,
          paddingVertical: 15,
          height: 70.5,
        }}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          {/* Cipher avatar */}
          {cipher.svg ? (
            <View>
              <cipher.svg height={40} width={40} />
            </View>
          ) : (
            <Image
              source={cipher.imgLogo || cipher.logo}
              backupSource={cipher.logo}
              style={{
                height: 40,
                width: 40,
                borderRadius: 8,
              }}
            />
          )}
          {/* Cipher avatar end */}

          <View style={{ flex: 1, marginLeft: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                preset="semibold"
                numberOfLines={1}
                text={cipher.name}
                style={{
                  color: color.textBlack,
                }}
              />
              {isExpired && (
                <View
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    backgroundColor: color.warning,
                    paddingHorizontal: 10,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                >
                  <Text
                    text={translate("common.expired").toUpperCase()}
                    style={{
                      color: color.background,
                      fontSize: 12,
                    }}
                  />
                </View>
              )}
            </View>
            {/* Name end */}

            {/* Description */}
            <Text
              text={translate("quick_shares.shared_begin", { time: description })}
              numberOfLines={1}
              style={{
                fontSize: fontSize.small,
                color: color.textBlack,
              }}
            />
            {/* Description end */}
          </View>
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
