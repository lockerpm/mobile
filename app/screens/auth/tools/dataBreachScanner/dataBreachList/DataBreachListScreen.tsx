import React from 'react'
import { observer } from 'mobx-react-lite'
import { View, Image, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/core'
import { Text, Screen, Header, Icon } from 'app/components/cores'
import { useTheme } from 'app/services/context'
import { useStores } from 'app/models'
import { useHelper } from 'app/services/hook'

export const DataBreachListScreen = observer(() => {
  const { colors } = useTheme()
  const navigation = useNavigation() as any
  const { translate } = useHelper()
  const { toolStore } = useStores()

  return (
    <Screen
      backgroundColor={colors.block}
      header={
        <Header
          leftIcon="arrow-left"
          title={toolStore.breachedEmail}
          onLeftPress={() => navigation.goBack()}
        />
      }
      contentContainerStyle={{
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: colors.background,
      }}
    >
      {toolStore.breaches.length === 0 ? (
        <View>
          <Text
            preset="bold"
            text={translate('data_breach_scanner.good_news').toUpperCase()}
            style={{
              marginBottom: 7,
              color: colors.primary,
            }}
          />
          <Text
            text={`${toolStore.breachedEmail}${translate('data_breach_scanner.no_breaches_found')}`}
          />
        </View>
      ) : (
        <View>
          <View>
            <Text
              preset="bold"
              text={translate('data_breach_scanner.bad_news').toUpperCase()}
              style={{
                marginBottom: 7,
                color: colors.error,
              }}
            />
            <Text
              text={`${toolStore.breachedEmail}${translate('data_breach_scanner.breaches_found', {
                count: toolStore.breaches.length,
              })}`}
            />
          </View>

          <View
            style={{
              backgroundColor: colors.background,
            }}
          >
            {toolStore.breaches.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  toolStore.setSelectedBreach(item)
                  navigation.navigate('dataBreachDetail')
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderBottomColor: colors.border,
                  borderBottomWidth: index !== toolStore.breaches.length - 1 ? 1 : 0,
                  justifyContent: 'space-between',
                  paddingVertical: 16,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      height: 40,
                      width: 40,
                      marginRight: 10,
                    }}
                  >
                    <Image
                      source={{ uri: item.logo_path }}
                      style={{
                        flex: 1,
                        height: undefined,
                        width: undefined,
                      }}
                      resizeMode="contain"
                    />
                  </View>

                  <View>
                    <Text text={item.title} />
                    <Text
                      preset="label"
                      size="base"
                      text={item.domain}
                      style={{
                        marginTop: 3,
                      }}
                    />
                  </View>
                </View>

                <Icon icon="caret-right" size={18} color={colors.title} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </Screen>
  )
})
