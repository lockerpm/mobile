import React, { memo, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import isEqual from 'lodash/isEqual'
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { Icon, Text } from 'app/components-v2/cores'
import { useTheme } from 'app/services/context'
import { getTOTP, parseOTPUri } from 'app/utils/totp'

type Prop = {
  item: any
  openActionMenu: (val: any) => void
  isSelected: boolean
}

export const OtpListItem = memo(
  (props: Prop) => {
    const { item, openActionMenu, isSelected } = props
    const { colors } = useTheme()

    const otpData = parseOTPUri(item.notes)

    const [otp, setOtp] = useState(getTOTP(otpData))

    // Calculate remaining time
    const getRemainingTime = (period: number) => {
      // Better late 1 sec than early
      return period + 1 - (Math.floor(new Date().getTime() / 1000) % period)
    }

    return (
      <TouchableOpacity
        onPress={() => {
          openActionMenu(item)
        }}
        style={{
          borderBottomColor: colors.border,
          borderBottomWidth: 0.5,
          paddingVertical: 15,
          backgroundColor: colors.background,
          height: 82,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Content */}
          <View style={{ flex: 1 }}>
            <View style={{ marginRight: 12, flex: 1, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text preset="bold" text={item.name} numberOfLines={1} ellipsizeMode="tail" />
              </View>

              {item.notSync && (
                <View style={{ marginLeft: 10 }}>
                  <Icon icon="wifi-slash" size={22} />
                </View>
              )}
            </View>

            <Text
              text={otp}
              size="large"
              style={{
                color: colors.primary,
              }}
            />
          </View>
          {/* Content end */}

          {isSelected && <Icon icon="check" size={22} color={colors.primary} />}
          <View style={{ opacity: 0, position: 'absolute' }}>
            <CountdownCircleTimer
              onComplete={() => {
                // index === 0 && updateOtp()
                setOtp(getTOTP(otpData))
                return [true, 0]
              }}
              size={25}
              isPlaying
              duration={30}
              colors={colors.primary}
              initialRemainingTime={getRemainingTime(otpData.period)}
              strokeWidth={4}
            />
          </View>
        </View>
      </TouchableOpacity>
    )
  },
  (prev, next) => {
    const whitelist = ['toggleItemSelection', 'openActionMenu', 'drag']
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
