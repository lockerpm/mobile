import React from "react"
import { observer } from "mobx-react-lite"
import { useWindowDimensions, View } from "react-native"
import { useNavigation } from "@react-navigation/core"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { Header, Layout, Text, AutoImage as Image } from "../../../../../components"
import { color as colorLight, colorDark, commonStyles, fontSize } from "../../../../../theme"
import moment from 'moment'
import numeral from 'numeral'
import RenderHtml from 'react-native-render-html'


export const DataBreachDetailScreen = observer(function DataBreachDetailScreen() {
  const { translate } = useMixins()
  const navigation = useNavigation()
  const { toolStore, uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

  const { width } = useWindowDimensions();
  const data = toolStore.selectedBreach

  return (
    <Layout
      borderTop
      header={(
        <Header
          title={toolStore.selectedBreach.title}
          goBack={() => navigation.goBack()}
          right={(
            <View style={{ width: 10 }} />
          )}
        />
      )}
    >
      {
        data && (
          <View>
            {/* Logo */}
            <View style={commonStyles.CENTER_VIEW}>
              <View
                style={{
                  height: 60,
                  width: 60,
                  marginBottom: 10
                }}
              >
                <Image
                  source={{ uri: data.logo_path }}
                  style={{
                    flex: 1,
                    height: undefined,
                    width: undefined
                  }}
                  resizeMode="contain"
                />
              </View>

              <Text
                preset="header"
                text={data.title}
              />
            </View>
            {/* Logo end */}

            {/* Basic info */}
            <Text
              preset="bold"
              style={{
                marginTop: 20,
                marginBottom: 7
              }}
            >
              {translate('common.website')}:
              <Text
                text={'  ' + data.domain}
                style={{
                  fontWeight: 'normal'
                }}
              />
            </Text>

            <Text
              preset="bold"
              style={{
                marginBottom: 7
              }}
            >
              {translate('data_breach_scanner.pwn_count')}: 
              <Text
                text={'  ' + numeral(data.pwn_count).format('0,0.[00]')}
                style={{
                  fontWeight: 'normal'
                }}
              />
            </Text>

            <Text
              preset="bold"
              style={{
                marginBottom: 7
              }}
            >
              {translate('data_breach_scanner.breach_date')}: 
              <Text
                text={'  ' + moment(data.breach_date).format('DD/MM/YYYY')}
                style={{
                  fontWeight: 'normal'
                }}
              />
            </Text>

            <Text
              preset="bold"
              style={{
                marginBottom: 20
              }}
            >
              {translate('data_breach_scanner.added_date')}: 
              <Text
                text={'  ' + moment(data.added_date).format('DD/MM/YYYY')}
                style={{
                  fontWeight: 'normal'
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
                  fontSize: fontSize.p,
                  color: color.text
                },
                a: {
                  color: color.primary,
                  textDecorationLine: 'none'
                }
              }}
            />
            {/* Desc end */}

            {/* Data classes */}
            <Text
              text={`${translate('data_breach_scanner.data_classes')}:`}
              style={{
                marginTop: 20
              }}
            />
            {
              data.data_classes.map((item, index) => (
                <Text
                  key={index}
                  text={`-  ${item}`}
                />
              ))
            }
            {/* Data classes end */}
          </View>
        )
      }
    </Layout>
  )
})
