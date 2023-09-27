/* eslint-disable react-native/no-color-literals */
import React from 'react'
import { View, Image, Dimensions, TouchableOpacity } from 'react-native'
import { Icon, Text } from 'app/components-v2/cores'
import { useTheme } from 'app/services/context'
import { translate } from 'app/i18n'

const REFER_LOCKER = require('assets/images/intro/refer-locker.png')

export const ReferFriendMenuItem = ({ onPress }: { onPress: () => void }) => {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        marginTop: 24,
      }}
    >
      <View
        style={{
          paddingHorizontal: 16,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          backgroundColor: '#072245',
          height: 80,
          justifyContent: 'center',
        }}
      >
        <Image
          source={REFER_LOCKER}
          style={{
            width: 128,
            height: 104,
            position: 'absolute',
            right: 16,
          }}
        />
        <Text
          preset="bold"
          style={{
            color: colors.white,
            maxWidth: Dimensions.get('screen').width - 200,
          }}
          text={translate('refer_friend.menu_title')}
        />
      </View>

      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 16,
          paddingVertical: 15,
          flex: 1,
          flexDirection: 'row',
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          justifyContent: 'space-between',
        }}
      >
        <Text
          preset="bold"
          style={{ color: colors.white }}
          text={translate('refer_friend.navigate')}
        />
        <Icon icon="caret-right" size={18} color={colors.white} />
      </View>
    </TouchableOpacity>
  )
}
