import React from 'react'
import { View } from 'react-native'
import { Text, Select, AutoImage as Image } from '../../../../../components'
import { useMixins } from '../../../../../services/mixins'
import { commonStyles, fontSize } from '../../../../../theme'
import { WALLET_APP_LIST } from '../../../../../utils/crypto/applist'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'


type Props = {
  alias: string
  onChange: (alias: string, name: string) => void
}

export const AppSelect = (props: Props) => {
  const { onChange, alias } = props
  const { translate, color } = useMixins()

  const selectedApp = WALLET_APP_LIST.find(c => c.alias === alias)
  const otherApp = WALLET_APP_LIST.find(c => c.alias === 'other')

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
      title={translate('crypto_asset.network')}
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
                    <View style={{
                      borderRadius: 20,
                      overflow: 'hidden',
                      marginRight: 10,
                      borderWidth: 1,
                      borderColor: color.line
                    }}>
                      <Image
                        source={selectedApp?.logo || otherApp.logo}
                        borderRadius={20}
                        style={{
                          borderRadius: 20,
                          height: 40,
                          width: 40,
                          backgroundColor: 'white',
                        }}
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
