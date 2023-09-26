import React, { memo } from 'react'
import { TouchableOpacity, View, Image } from 'react-native'
import isEqual from 'lodash/isEqual'
import { Icon, Text } from 'app/components-v2/cores'
import { CipherView } from 'core/models/view'
import { SharedMemberType, SharingStatus } from 'app/static/types'
import { useTheme } from 'app/services/context'
import { translate } from 'app/i18n'

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
    const { colors } = useTheme()

    // Get cipher description
    const getDescription = (item: CipherShareType) => {
      return item.description
    }

    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            openActionMenu(item)
          }}
          style={{
            borderBottomColor: colors.border,
            borderBottomWidth: 0.5,
            paddingVertical: 15,
            height: 70.5,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Cipher avatar */}
            {item.svg ? (
              <item.svg height={40} width={40} />
            ) : (
              <Image
                source={item.imgLogo || item.logo}
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 8,
                }}
              />
            )}

            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text
                    preset="bold"
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
                          ? colors.warning
                          : item.status === SharingStatus.ACCEPTED
                          ? colors.title
                          : colors.primary,
                      borderRadius: 3,
                    }}
                  >
                    <Text
                      size="small"
                      text={
                        item.status === SharingStatus.ACCEPTED
                          ? translate('shares.wait_confirm')
                          : item.status.toUpperCase()
                      }
                      style={{
                        fontWeight: 'bold',
                        color: colors.background,
                      }}
                    />
                  </View>
                )}
                {/* Sharing status */}

                {/* Not sync icon */}
                {item.notSync && (
                  <View style={{ marginLeft: 10 }}>
                    <Icon icon="wifi-slash" size={22} />
                  </View>
                )}
                {/* Not sync icon end */}
              </View>

              {/* Description */}
              {!!getDescription(item) && (
                <Text preset="label" size="base" text={getDescription(item)} numberOfLines={1} />
              )}
              {/* Description end */}
            </View>
          </View>
        </TouchableOpacity>

        {item?.status === SharingStatus.ACCEPTED && (
          <View
            style={{
              flexDirection: 'row',
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
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 8,
                  borderColor: colors.primary,
                  borderWidth: 1,
                  padding: 8,
                  paddingHorizontal: 16,
                }}
              >
                <Icon icon="check" color={colors.primary} size={24} />
                <Text
                  text={translate('common.confirm')}
                  style={{
                    marginLeft: 8,
                    color: colors.primary,
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
    const whitelist = ['openActionMenu']
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
