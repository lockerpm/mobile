import React, { memo, useState } from 'react'
import { TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { Checkbox } from 'react-native-ui-lib'
import isEqual from 'lodash/isEqual'
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { Text, Icon } from 'app/components-v2/cores'
import { useTheme } from 'app/services/context'
import { getTOTP, parseOTPUri } from 'app/utils/totp'

type Prop = {
  item: any
  isSelecting: boolean
  toggleItemSelection: (id: string) => void
  openActionMenu: (val: any) => void
  isSelected: boolean
  drag: () => void
}

export const OtpListItem = memo(
  (props: Prop) => {
    const { item, isSelecting, toggleItemSelection, openActionMenu, isSelected, drag } = props
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
          if (isSelecting) {
            toggleItemSelection(item.id)
          } else {
            openActionMenu(item)
          }
        }}
        onLongPress={() => {
          if (isSelecting) {
            drag()
          } else {
            toggleItemSelection(item.id)
          }
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
          {/* Drag anchor */}
          {isSelecting && (
            <TouchableWithoutFeedback
              onPressIn={() => {
                drag()
              }}
            >
              <View
                style={{
                  paddingVertical: 10,
                  paddingRight: 15,
                }}
              >
                <Icon icon="list-bullets" size={18} color={colors.title} />
              </View>
            </TouchableWithoutFeedback>
          )}
          {/* Drag anchor end */}

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View style={{ marginRight: 12, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text preset="bold" text={item.name} numberOfLines={1} ellipsizeMode="tail" />
              </View>

              {item.notSync && (
                <View style={{ marginLeft: 10 }}>
                  <Icon icon="wifi-slash" size={22} color={colors.title} />
                </View>
              )}
            </View>

            <Text
              text={otp}
              style={{
                color: colors.primary,
                fontSize: 18,
              }}
            />
          </View>
          {/* Content end */}

          {/* Couter/Select */}
          {isSelecting ? (
            <Checkbox
              value={isSelected}
              color={colors.primary}
              onValueChange={() => {
                toggleItemSelection(item.id)
              }}
            />
          ) : (
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
          )}
          {/* Couter/Select end */}
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
