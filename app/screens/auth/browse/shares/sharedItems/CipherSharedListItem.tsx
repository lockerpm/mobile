import React, { memo } from "react"
import { TouchableOpacity, View } from "react-native"
import isEqual from "lodash/isEqual"
import { Icon, Text, Toggle } from "app/components/cores"
import { AccountRole } from "app/static/types"
import { CipherView } from "core/models/view"
import { useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { CipherIconImage } from "app/components/ciphers/cipherList/CipherIconImage"
import { IS_IOS } from "app/config/constants"

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

export const CipherSharedListItem = memo(
  (props: Prop) => {
    const { item, isSelecting, toggleItemSelection, openActionMenu, isSelected, org } = props
    const { colors } = useTheme()
    const { translate } = useHelper()

    const getDescription = (item: CipherSharedType) => {
      if (item.isShared) {
        return item.description
      }

      let shareType = ""
      if (org) {
        switch (org.type) {
          case AccountRole.MEMBER:
            // shareType = item.viewPassword ? translate('shares.share_type.view') : translate('shares.share_type.only_fill')
            shareType = translate("shares.share_type.view")
            break
          case AccountRole.ADMIN:
            shareType = translate("shares.share_type.edit")
            break
        }
      }
      return org ? `${org.name} - ${shareType}` : ""
    }

    return (
      <TouchableOpacity
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
          borderBottomColor: colors.border,
          borderBottomWidth: 0.5,
          paddingVertical: 15,
          height: 70.5,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <CipherIconImage
            defaultSource={IS_IOS ? BROWSE_ITEMS.password.icon : undefined}
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
                <Text preset="bold" text={item.name} numberOfLines={1} />
              </View>

              {/* Pending status */}
              {item.isShared && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 2,
                    backgroundColor: colors.warning,
                    borderRadius: 3,
                  }}
                >
                  <Text
                    text={translate("common.pending")}
                    preset="bold"
                    size="small"
                    color={colors.background}
                  />
                </View>
              )}

              {item.notSync && (
                <View style={{ marginLeft: 10 }}>
                  <Icon icon="wifi-slash" size={22} color={colors.title} />
                </View>
              )}
            </View>

            {/* Description */}
            {!!getDescription(item) && (
              <Text
                size="base"
                preset="label"
                text={getDescription(item)}
                style={{ marginTop: 3 }}
                numberOfLines={1}
              />
            )}

            {!!item.login.username && (
              <Text
                size="base"
                preset="label"
                text={item.login.username}
                style={{ marginTop: 3 }}
                numberOfLines={1}
              />
            )}
          </View>
          {isSelecting ? (
            <Toggle
              variant="checkbox"
              value={isSelected}
              onValueChange={() => {
                toggleItemSelection(item.id)
              }}
            />
          ) : (
            <View />
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
