import React, { memo } from "react"
import { TouchableOpacity, View } from "react-native"
import MaterialCommunityIconsIcon from "react-native-vector-icons/MaterialCommunityIcons"
// import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import isEqual from "lodash/isEqual"
import { CipherView } from "../../../../../../core/models/view"
import { SharingStatus } from "../../../../../config/types"
import { useMixins } from "../../../../../services/mixins"
import { Button, Icon, AutoImage as Image, Text } from "../../../../../components"
import { commonStyles, fontSize } from "../../../../../theme"
import { SharedMemberType } from "../../../../../config/types/api"

type Prop = {
  item: CipherShareType
  openActionMenu: (val: any) => void
  setShowConfirmModal: (val: any) => void
}

export type CipherShareType = CipherView & {
  logo?: any
  imgLogo?: any
  svg?: any
  notSync?: boolean
  description?: string
  status?: string
  member?: SharedMemberType
}

export const CipherShareListItem = memo(
  (props: Prop) => {
    const { item, openActionMenu, setShowConfirmModal } = props
    const { color, translate } = useMixins()

    // Get cipher description
    const getDescription = (item: CipherShareType) => {
      return item.description
    }

    return (
      <View>
        <Button
          preset="link"
          onPress={() => {
            // goToDetail(item)
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
              <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
                <View style={{ flex: 1 }}>
                  <Text
                    preset="semibold"
                    text={item.name}
                    numberOfLines={1}
                    style={{
                      marginRight: item.status ? 10 : 0,
                    }}
                  />
                </View>

                {/* Sharing status */}
                {item.status && (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 2,
                      backgroundColor:
                        item.status === SharingStatus.INVITED
                          ? color.warning
                          : item.status === SharingStatus.ACCEPTED
                          ? color.info
                          : color.primary,
                      borderRadius: 3,
                    }}
                  >
                    <Text
                      text={
                        item.status === SharingStatus.ACCEPTED
                          ? translate('shares.wait_confirm')
                          : item.status.toUpperCase()
                      }
                      style={{
                        fontWeight: "bold",
                        color: color.background,
                        fontSize: fontSize.mini,
                      }}
                    />
                  </View>
                )}
                {/* Sharing status */}

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

              {/* Description */}
              {!!getDescription(item) && (
                <Text
                  text={getDescription(item)}
                  style={{ fontSize: fontSize.small }}
                  numberOfLines={1}
                />
              )}
              {/* Description end */}
            </View>
          </View>
        </Button>

        {item?.status === SharingStatus.ACCEPTED && (
          <View
            style={{
              flexDirection: "row",
              marginVertical: 8,
            }}
          >
            <Text
              text={translate('shares.confirm')}
              style={{
                flex: 2,
                fontSize: 14,
              }}
            />
            <View>
              <TouchableOpacity
                onPress={() => {
                  setShowConfirmModal(item)
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 8,
                  borderColor: color.primary,
                  borderWidth: 1,
                  padding: 8,
                  paddingHorizontal: 16,
                }}
              >
                <Icon icon="check" color={color.primary} size={24} />
                <Text
                  text={translate('common.confirm')}
                  style={{
                    marginLeft: 8,
                    color: color.primary,
                    fontSize: 14,
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    )
  },
  (prev, next) => {
    const whitelist = ["openActionMenu"]
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
