import React from 'react'
import { ImageStyle, View, ViewStyle } from 'react-native'
import { Text, Select, AutoImage as Image } from '../../../../../components'
import { useMixins } from '../../../../../services/mixins'
import { commonStyles, fontSize } from '../../../../../theme'
import { WALLET_APP_LIST } from '../../../../../utils/crypto/applist'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import IonIconsIcon from 'react-native-vector-icons/Ionicons'


type Props = {
  alias: string
  onChange: (alias: string, name: string) => void
}

export const AppSelect = (props: Props) => {
  const { onChange, alias } = props
  const { translate, color } = useMixins()

  // ------------------ METHODS ------------------

  const findApp = (al: string) => {
    return WALLET_APP_LIST.find(c => c.alias === al)
  }

  // ------------------ COMPUTED ------------------

  const selectedApp = findApp(alias)
  const otherApp = findApp('other')

  // ------------------ RENDER ------------------

  const IMG_CONTAINER: ViewStyle = {
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 1,
    borderColor: color.line
  }

  const IMG: ImageStyle = {
    borderRadius: 20,
    height: 40,
    width: 40,
    backgroundColor: 'white',
  }

  return (
    <Select
      showSearch
      value={alias}
      onChange={(alias: string) => {
        const app = WALLET_APP_LIST.find(a => a.alias === alias)
        onChange(alias, app.name)
      }}
      options={WALLET_APP_LIST.map(a => ({
        label: a.name,
        value: a.alias
      }))}
      title={translate('crypto_asset.wallet_app')}
      renderItem={(value, { isSelected }, itemLabel) => (
        <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
          backgroundColor: color.background,
          paddingHorizontal: 16,
          paddingVertical: 8
        }]}>
          <View style={IMG_CONTAINER}>
            <Image
              source={findApp(value)?.logo || otherApp.logo}
              borderRadius={20}
              style={IMG}
            />
          </View>
          <Text
            preset='black'
            text={itemLabel}
            style={{ flex: 1, marginRight: 20 }}
          />
          {
            isSelected && (
              <IonIconsIcon
                name='checkmark'
                color={color.primary}
                size={24}
              />
            )
          }
        </View>
      )}
      renderSelected={({ label }) => (
        <View style={{ flex: 1 }}>
          <View
            style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
              justifyContent: 'space-between',
              width: '100%',
            }]}
          >
            <View>
              <Text
                text={translate('crypto_asset.wallet_app')}
                style={{ fontSize: fontSize.small, marginBottom: 5 }}
              />
              <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
                {
                  !!alias && (
                    <View style={IMG_CONTAINER}>
                      <Image
                        source={selectedApp?.logo || otherApp.logo}
                        borderRadius={20}
                        style={IMG}
                      />
                    </View>
                  )
                }
                <Text
                  preset="black"
                  text={label || translate('common.none')}
                />
              </View>
            </View>
            <FontAwesomeIcon
              name="angle-right"
              size={20}
              color={color.text}
            />
          </View>
        </View>
      )}
    />
  )
}
