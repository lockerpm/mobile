import React, { memo } from "react"
import { View } from "react-native"
import { Checkbox } from "react-native-ui-lib"
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
// import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import isEqual from 'lodash/isEqual'
import { CipherView } from "../../../../../../core/models/view"
import { AccountRole } from "../../../../../config/types"
import { useMixins } from "../../../../../services/mixins"
import { Button, AutoImage as Image, Text } from "../../../../../components"
import { commonStyles, fontSize } from "../../../../../theme"


type Prop = {
  item: CipherSharedType
  isSelecting: boolean
  toggleItemSelection: (id: string) => void
  openActionMenu: (val: any) => void
  isSelected: boolean
  org?: {
    id: string
    type: AccountRole
    name: string
  }
}

export type CipherSharedType = CipherView & {
  isShared?: boolean
  description?: string
  logo?: any
  imgLogo?: any
  svg?: any
  notSync?: boolean
}


export const CipherSharedListItem = memo((props: Prop) => {
  const { item, isSelecting, toggleItemSelection, openActionMenu, isSelected, org } = props
  const { color, translate } = useMixins()

  const getDescription = (item: CipherSharedType) => {
    if (item.isShared) {
      return item.description
    }

    let shareType = ''
    if (org) {
      switch (org.type) {
        case AccountRole.MEMBER:
          // shareType = item.viewPassword ? translate('shares.share_type.view') : translate('shares.share_type.only_fill')
          shareType = translate('shares.share_type.view')
          break
        case AccountRole.ADMIN:
          shareType = translate('shares.share_type.edit')
          break
      }
    }
    return org ? `${org.name} - ${shareType}` : ''
  }

  return (
    <Button
      preset="link"
      onPress={() => {
        if (isSelecting) {
          toggleItemSelection(item.id)
        } else {
          // goToDetail(item)
          openActionMenu(item)
        }
      }}
      onLongPress={() => !item.isShared && toggleItemSelection(item.id)}
      style={{
        borderBottomColor: color.line,
        borderBottomWidth: 0.5,
        paddingVertical: 15,
        height: 70.5
      }}
    >
      <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
        {/* Cipher avatar */}
        {
          item.svg ? (
            <item.svg height={40} width={40} />
          ) : (
            <Image
              source={item.imgLogo || item.logo}
              backupSource={item.logo}
              style={{
                height: 40,
                width: 40,
                borderRadius: 8
              }}
            />
          )
        }
        {/* Cipher avatar end */}

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={[commonStyles.CENTER_HORIZONTAL_VIEW]}>
            <View style={{ flex: 1 }}>
              <Text
                preset="semibold"
                text={item.name}
                numberOfLines={1}
              />
            </View>

            {/* Pending status */}
            {
              item.isShared && (
                <View style={{
                  paddingHorizontal: 10,
                  paddingVertical: 2,
                  backgroundColor: color.warning,
                  borderRadius: 3,
                  marginLeft: 10
                }}>
                  <Text
                    text="PENDING"
                    style={{
                      fontWeight: 'bold',
                      color: color.background,
                      fontSize: fontSize.mini
                    }}
                  />
                </View>
              )
            }
            {/* Pending status */}

            {/* Not sync icon */}
            {
              item.notSync && (
                <View style={{ marginLeft: 10 }}>
                  <MaterialCommunityIconsIcon
                    name="cloud-off-outline"
                    size={22}
                    color={color.textBlack}
                  />
                </View>
              )
            }
            {/* Not sync icon end */}
          </View>

          {/* Description */}
          {
            !!getDescription(item) && (
              <Text
                text={getDescription(item)}
                style={{ fontSize: fontSize.small }}
                numberOfLines={1}
              />
            )
          }
          {/* Description end */}
        </View>

        {
          isSelecting ? (
            <Checkbox
              value={isSelected}
              color={color.primary}
              onValueChange={() => {
                toggleItemSelection(item.id)
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
          )
        }
      </View>
    </Button>
  )
}, (prev, next) => {
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
})
