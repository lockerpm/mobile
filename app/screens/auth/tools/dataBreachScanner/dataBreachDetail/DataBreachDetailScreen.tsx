import React from 'react'
import { observer } from 'mobx-react-lite'
import { useWindowDimensions, View, Image } from 'react-native'
import { useNavigation } from '@react-navigation/core'
import moment from 'moment'
import numeral from 'numeral'
import RenderHtml from 'react-native-render-html'
import { Text, Screen, Header } from 'app/components/cores'
import { useTheme } from 'app/services/context'
import { useStores } from 'app/models'
import { useHelper } from 'app/services/hook'

export const DataBreachDetailScreen = observer(() => {
  const { colors } = useTheme()
  const navigation = useNavigation()
  const { translate } = useHelper()
  const { toolStore } = useStores()

  const { width } = useWindowDimensions()
  const data = toolStore.selectedBreach

  return (
    <Screen
      preset="auto"
      padding
      safeAreaEdges={['bottom']}
      header={
        <Header
          leftIcon="arrow-left"
          title={toolStore.selectedBreach.title}
          onLeftPress={() => navigation.goBack()}
        />
      }
      contentContainerStyle={{
        flex: 1,
      }}
    >
      {data && (
        <View>
          {/* Logo */}
          <View style={{ justifyContent: 'center' }}>
            <View
              style={{
                height: 60,
                width: 60,
                marginBottom: 10,
              }}
            >
              <Image
                source={{ uri: data.logo_path }}
                style={{
                  flex: 1,
                  height: undefined,
                  width: undefined,
                }}
                resizeMode="contain"
              />
            </View>

            <Text preset="bold" size="xl" text={data.title} />
          </View>

          <Text
            preset="bold"
            style={{
              marginTop: 20,
              marginBottom: 7,
            }}
          >
            {translate('common.website')}:
            <Text
              text={'  ' + data.domain}
              style={{
                fontWeight: 'normal',
              }}
            />
          </Text>

          <Text
            preset="bold"
            style={{
              marginBottom: 7,
            }}
          >
            {translate('data_breach_scanner.pwn_count')}:
            <Text
              text={'  ' + numeral(data.pwn_count).format('0,0.[00]')}
              style={{
                fontWeight: 'normal',
              }}
            />
          </Text>

          <Text
            preset="bold"
            style={{
              marginBottom: 7,
            }}
          >
            {translate('data_breach_scanner.breach_date')}:
            <Text
              text={'  ' + moment(data.breach_date).format('DD/MM/YYYY')}
              style={{
                fontWeight: 'normal',
              }}
            />
          </Text>

          <Text
            preset="bold"
            style={{
              marginBottom: 20,
            }}
          >
            {translate('data_breach_scanner.added_date')}:
            <Text
              text={'  ' + moment(data.added_date).format('DD/MM/YYYY')}
              style={{
                fontWeight: 'normal',
              }}
            />
          </Text>
          {/* Basic info end */}

          {/* Desc */}
          <RenderHtml
            contentWidth={width}
            source={{ html: data.description }}
            tagsStyles={{
              body: {
                fontSize: 16,
                color: colors.title,
              },
              a: {
                color: colors.primary,
                textDecorationLine: 'none',
              },
            }}
          />
          {/* Desc end */}

          {/* Data classes */}
          <Text
            text={`${translate('data_breach_scanner.data_classes')}:`}
            style={{
              marginTop: 20,
            }}
          />
          {data.data_classes.map((item, index) => (
            <Text key={index} text={`-  ${item}`} />
          ))}
          {/* Data classes end */}
        </View>
      )}
    </Screen>
  )
})
