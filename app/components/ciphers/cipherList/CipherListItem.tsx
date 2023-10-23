import isEqual from 'lodash/isEqual'
import React, { memo } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Icon, Text, Toggle, AutoImage as Image } from '../../cores'
import { CipherType } from 'core/enums'
import { useCipherHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { CipherAppView } from 'app/static/types'

type Prop = {
  item: CipherAppView
  isSelecting: boolean
  toggleItemSelection: (id: string) => void
  openActionMenu: (val: any) => void
  isSelected: boolean
  isShared: boolean
}

export const CipherListItem = memo(
  (props: Prop) => {
    const { item, isSelecting, toggleItemSelection, openActionMenu, isSelected, isShared } = props
    const { colors } = useTheme()
    const { getCipherDescription } = useCipherHelper()

    // Disable toggleItemSelection for master password item
    const isMasterPwItem = item.type === CipherType.MasterPassword

    return (
      <TouchableOpacity
        onPress={() => {
          if (isSelecting) {
            !isMasterPwItem && toggleItemSelection(item.id)
          } else {
            // goToDetail(item)
            openActionMenu(item)
          }
        }}
        onLongPress={() => {
          !isMasterPwItem && toggleItemSelection(item.id)
        }}
        style={{
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          paddingVertical: 12,
          paddingHorizontal: 20,
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
            {/* Name */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text preset="bold" numberOfLines={1} text={item.name} style={{ maxWidth: '80%' }} />

              {/* Belong to team icon */}
              {isShared && (
                <Icon icon="users-three" size={22} containerStyle={{ marginLeft: 10 }} />
              )}
              {/* Belong to team icon end */}

              {/* Not sync icon */}
              {item.notSync && (
                <Icon icon="wifi-slash" size={22} containerStyle={{ marginLeft: 10 }} />
              )}
            </View>

            {!!getCipherDescription(item) && (
              <Text
                preset="label"
                size="base"
                text={getCipherDescription(item)}
                numberOfLines={1}
              />
            )}
          </View>

          {isSelecting && !isMasterPwItem && (
            <Toggle
              disabled
              value={isSelected}
              containerStyle={{
                marginLeft: 15,
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    )
  },
  (prev, next) => {
    const whitelist = ['toggleItemSelection', 'openActionMenu']
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
