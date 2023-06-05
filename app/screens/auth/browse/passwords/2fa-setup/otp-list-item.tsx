import React, { memo, useState } from "react"
import { View } from "react-native"
import MaterialCommunityIconsIcon from "react-native-vector-icons/MaterialCommunityIcons"
import isEqual from "lodash/isEqual"
import { useMixins } from "../../../../../services/mixins"
import { Button, Text } from "../../../../../components"
import { commonStyles, fontSize } from "../../../../../theme"
import { getTOTP, parseOTPUri } from "../../../../../utils/totp"
import { CountdownCircleTimer } from "react-native-countdown-circle-timer"

type Prop = {
  item: any
  openActionMenu: (val: any) => void
  isSelected: boolean
}

export const OtpListItem = memo(
  (props: Prop) => {
    const { item, openActionMenu, isSelected } = props
    const { color } = useMixins()

    const otpData = parseOTPUri(item.notes)

    const [otp, setOtp] = useState(getTOTP(otpData))
    
    // Calculate remaining time
    const getRemainingTime = (period: number) => {
      // Better late 1 sec than early
      return period + 1 - (Math.floor(new Date().getTime() / 1000) % period)
    }

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
          backgroundColor: color.background,
          height: 82,
        }}
      >
        <View
          style={[
            commonStyles.CENTER_HORIZONTAL_VIEW,
            {
              justifyContent: "space-between",
            },
          ]}
        >
          {/* Content */}
          <View style={{ flex: 1 }}>
            <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { marginRight: 12 }]}>
              <View style={{ flex: 1 }}>
                <Text preset="semibold" text={item.name} numberOfLines={1} ellipsizeMode="tail" />
              </View>

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

            <Text
              text={otp}
              style={{
                color: color.primary,
                fontSize: fontSize.h3,
              }}
            />
          </View>
          {/* Content end */}

          {isSelected && (
            <MaterialCommunityIconsIcon name="check" size={22} color={color.primary} />
          )}
          <View style={{ opacity: 0, position: "absolute" }}>
            <CountdownCircleTimer
              onComplete={() => {
                // index === 0 && updateOtp()
                setOtp(getTOTP(otpData))
                return [true, 0]
              }}
              size={25}
              isPlaying
              duration={30}
              colors={color.primary}
              initialRemainingTime={getRemainingTime(otpData.period)}
              strokeWidth={4}
            />
          </View>
        </View>
      </Button>
    )
  },
  (prev, next) => {
    const whitelist = ["toggleItemSelection", "openActionMenu", "drag"]
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
