import React from 'react'
import { ImageStyle, View, ViewStyle } from 'react-native'
import { Text, Select, AutoImage as Image } from '../../../../../components'
import { useMixins } from '../../../../../services/mixins'
import { commonStyles, fontSize } from '../../../../../theme'
import { CHAIN_LIST } from '../../../../../utils/crypto/chainlist'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import IonIconsIcon from 'react-native-vector-icons/Ionicons'


type Props = {
  selected: {
    alias: string
    name: string
  }[]
  onChange: (items: { alias: string; name: string }[]) => void
}

export const ChainSelect = (props: Props) => {
  const { onChange, selected } = props
  const { translate, color } = useMixins()

  // ------------------ METHODS ------------------

  const findChain = (al: string) => {
    return CHAIN_LIST.find(c => c.alias === al)
  }

  // ------------------ COMPUTED ------------------

  const otherChain = findChain('other')

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
      multiple
      value={selected.map(i => i.alias)}
      onChange={(values) => {
        const chains = values.map((alias: string) => findChain(alias))
        onChange(chains)
      }}
      options={CHAIN_LIST.map(c => ({
        label: c.name,
        value: c.alias
      }))}
      title={translate('crypto_asset.network')}
      renderItem={(value, { isSelected }, itemLabel) => (
        <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
          backgroundColor: color.background,
          paddingHorizontal: 16,
          paddingVertical: 8
        }]}>
          <View style={IMG_CONTAINER}>
            <Image
              source={findChain(value)?.logo || otherChain.logo}
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
      renderSelected={() => (
        <View style={{ flex: 1 }}>
          <View
            style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
              width: '100%'
            }]}
          >
            <View style={{ flex: 1 }}>
              <Text
                text={translate('crypto_asset.network')}
                style={{ fontSize: fontSize.small, marginBottom: 5 }}
              />
              <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
                flex: 1,
                flexWrap: 'wrap'
              }]}>
                {
                  selected.length ? (
                    selected.map((item) => {
                      const selectedChain = findChain(item.alias)
                      return (
                        <View
                          key={item.alias}
                          style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
                            marginRight: 12,
                            marginVertical: 2
                          }]}
                        >
                          <View style={IMG_CONTAINER}>
                            <Image
                              source={selectedChain?.logo || otherChain.logo}
                              borderRadius={20}
                              style={IMG}
                            />
                          </View>

                          <Text
                            preset="black"
                            text={item.name}
                          />
                        </View>
                      )
                    })
                  ) : (
                    <Text
                      preset="black"
                      text={translate('common.none')}
                    />
                  )
                }
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
