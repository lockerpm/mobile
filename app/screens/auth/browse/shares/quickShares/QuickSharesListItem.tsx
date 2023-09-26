import React, { memo } from 'react'
import { TouchableOpacity, View, Image } from 'react-native'
import isEqual from 'lodash/isEqual'
import moment from 'moment'
import { SendView } from 'core/models/view/sendView'
import { useTheme } from 'app/services/context'
import { useCipherHelper } from 'app/services/hook'
import { Text } from 'app/components-v2/cores'
import { translate } from 'app/i18n'

type Prop = {
  item: SendView
  openActionMenu: (val: any) => void
}

export const QuickSharesCipherListItem = memo(
  (props: Prop) => {
    const { openActionMenu, item } = props
    const { colors } = useTheme()
    const { getCipherInfo } = useCipherHelper()

    const cipherInfo = getCipherInfo(item.cipher)

    const cipher = {
      ...item.cipher,
      imgLogo: cipherInfo.img,
    }
    const description = moment.unix(item.creationDate.getTime() / 1000).fromNow()

    const isExpired = item.expirationDate?.getTime() < Date.now()
    return (
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
          <Image
            source={cipher.imgLogo}
            style={{
              height: 40,
              width: 40,
              borderRadius: 8,
            }}
          />

          <View style={{ flex: 1, marginLeft: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                preset="bold"
                numberOfLines={1}
                text={cipher.name}
                style={{
                  color: colors.title,
                }}
              />
              {isExpired && (
                <View
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    backgroundColor: colors.warning,
                    paddingHorizontal: 10,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                >
                  <Text
                    text={translate('common.expired').toUpperCase()}
                    style={{
                      color: colors.background,
                      fontSize: 12,
                    }}
                  />
                </View>
              )}
            </View>

            <Text
              size="base"
              text={translate('quick_shares.shared_begin', { time: description })}
              numberOfLines={1}
            />
          </View>
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
