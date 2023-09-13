import React, { memo } from 'react'
import { View } from 'react-native'
import { useMixins } from '../../../services/mixins'
import { commonStyles, fontSize } from '../../../theme'
import { Button } from '../../button/button'
import { Text } from '../../text/text'
import { AutoImage as Image } from '../../auto-image/auto-image'
import { useCipherHelpersMixins } from '../../../services/mixins/cipher/helpers'
import { Checkbox } from 'react-native-ui-lib'
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
// import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import isEqual from 'lodash/isEqual'
import { CipherType } from '../../../../core/enums'

type Prop = {
  item: any
  isSelecting: boolean
  toggleItemSelection: (id: string) => void
  openActionMenu: (val: any) => void
  isSelected: boolean
  isShared: boolean
}

export const CipherListItem = memo(
  (props: Prop) => {
    const { item, isSelecting, toggleItemSelection, openActionMenu, isSelected, isShared } = props
    const { color } = useMixins()
    const { getCipherDescription } = useCipherHelpersMixins()

    // Disable toggleItemSelection for master password item
    const isMasterPwItem = item.type === CipherType.MasterPassword

    return (
      <Button
        preset="link"
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
          borderBottomColor: color.line,
          borderBottomWidth: 0.5,
          paddingVertical: 15,
          height: 70.5,
        }}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          {/* Cipher avatar */}
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
          {/* Cipher avatar end */}

          <View style={{ flex: 1, marginLeft: 12 }}>
            {/* Name */}
            <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
              <View style={{ flex: 1 }}>
                <Text preset="semibold" numberOfLines={1} text={item.name} />
              </View>

              {/* Belong to team icon */}
              {isShared && (
                <View style={{ marginLeft: 10 }}>
                  <MaterialCommunityIconsIcon
                    name="account-group-outline"
                    size={22}
                    color={color.textBlack}
                  />
                </View>
              )}
              {/* Belong to team icon end */}

              {/* Not sync icon */}
              {item.notSync && (
                <View style={{ marginLeft: 10 }}>
                  <MaterialCommunityIconsIcon
                    name="cloud-off-outline"
                    size={22}
                    color={color.textBlack}
                  />
                </View>
              )}
              {/* Not sync icon end */}
            </View>
            {/* Name end */}

            {/* Description */}
            {!!getCipherDescription(item) && (
              <Text
                text={getCipherDescription(item)}
                style={{ fontSize: fontSize.small }}
                numberOfLines={1}
              />
            )}
            {/* Description end */}
          </View>

          {isSelecting && !isMasterPwItem ? (
            <Checkbox
              value={isSelected}
              color={color.primary}
              onValueChange={() => {
                toggleItemSelection(item.id)
              }}
              style={{
                marginLeft: 15,
              }}
            />
          ) : (
            <View />
            // <Button
            //   preset="link"
            //   onPress={() => openActionMenu(item)}
            //   style={{
            //     height: 40,
            //     width: 40,
            //     justifyContent: 'flex-end',
            //     alignItems: 'center'
            //   }}
            // >
            //   <IoniconsIcon
            //     name="ellipsis-horizontal"
            //     size={18}
            //     color={color.textBlack}
            //   />
            // </Button>
          )}
        </View>
      </Button>
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
