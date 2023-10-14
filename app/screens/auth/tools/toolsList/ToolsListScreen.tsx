import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { useStores } from 'app/models'
import { Text, Screen, Icon, ImageIcon } from 'app/components/cores'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from 'app/services/context'
import { TOOLS_ITEMS, ToolsItem } from 'app/navigators'
import { TabHeader } from 'app/components/cores/header/TabHeader'
import { PremiumTag } from 'app/components/utils'
import { observer } from 'mobx-react-lite'
import { useHelper } from 'app/services/hook'

export const ToolsListScreen = observer(() => {
  const navigation = useNavigation() as any
  const { user } = useStores()
  const { translate } = useHelper()
  const { colors, isDark } = useTheme()

  const isFreeAccount = user.isFreePlan

  // -----------------------METHODS----------------------------

  const handleNavigate = (item: ToolsItem) => {
    if (item.premium && isFreeAccount) {
      navigation.navigate('payment')
      return
    }
    switch (item.routeName) {
      case 'authenticator':
        navigation.navigate('mainTab', { screen: 'authenticatorTab' })
        break
      case 'passwordHealth':
        navigation.navigate('toolsStack', { screen: 'passwordHealth' })
        break
      case 'privateRelay':
        navigation.navigate('toolsStack', { screen: 'privateRelay' })
        break
      default:
        navigation.navigate(item.routeName, { fromTools: true })
    }
  }

  return (
    <Screen
      padding
      backgroundColor={isDark ? colors.background : colors.block}
      header={<TabHeader title={translate('common.tools')} />}
    >
      <View
        style={{
          backgroundColor: isDark ? colors.block : colors.background,
          borderRadius: 12,
          paddingHorizontal: 16,
          marginTop: 20,
        }}
      >
        {Object.values(TOOLS_ITEMS).map((item, index) => {
          if (user.onPremiseUser && item.routeName === 'privateRelay') {
            return null
          }

          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                handleNavigate(item)
              }}
              style={{
                borderBottomColor: colors.border,
                borderBottomWidth: index === Object.keys(TOOLS_ITEMS).length - 1 ? 0 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
              }}
            >
              <ImageIcon icon={item.icon} size={40} />

              <View style={{ flex: 1, paddingHorizontal: 10 }}>
                <View style={{ flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    tx={item.label}
                    style={{
                      marginBottom: 3,
                      marginRight: item.premium ? 7 : 0,
                    }}
                  />

                  {item.premium && isFreeAccount && <PremiumTag />}
                </View>

                <Text preset="label" tx={item.desc} size="base" />
              </View>

              <Icon icon="caret-right" size={20} color={colors.title} />
            </TouchableOpacity>
          )
        })}
      </View>
    </Screen>
  )
})
