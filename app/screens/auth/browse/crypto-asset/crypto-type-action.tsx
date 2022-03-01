import React from 'react'
import { View } from 'react-native'
import { BROWSE_ITEMS } from '../../../../common/mappings'
import { ActionSheet, ActionSheetContent, ActionSheetItem, Text, AutoImage as Image, Divider } from '../../../../components'
import { useMixins } from '../../../../services/mixins'
import { commonStyles, fontSize } from '../../../../theme'


type Props = {
  navigation: any
  isOpen: boolean
  onClose: () => void
}

export const CryptoTypeAction = (props: Props) => {
  const { isOpen, onClose, navigation } = props
  const { color, translate } = useMixins()

  const items = Object.values(BROWSE_ITEMS).filter(item => item.group === 'cryptoAsset')

  return (
    <ActionSheet
      isOpen={isOpen}
      onClose={onClose}
    >
      <View style={{ width: '100%', paddingHorizontal: 20 }}>
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <View style={{ marginLeft: 10 }}>
            <Text
              preset="semibold"
              text={translate('crypto_asset.choose_type')}
              style={{ fontSize: fontSize.h4 }}
            />
            <Text
              text={translate('crypto_asset.choose_type_desc')}
              style={{ fontSize: fontSize.small }}
            />
          </View>
        </View>
      </View>

      <Divider style={{ marginTop: 10 }} />

      <ActionSheetContent>
        {
          items.map((item, index) => (
            <ActionSheetItem
              key={index}
              border={index !== items.length - 1}
              onPress={() => {
                onClose()
                navigation.navigate(`${item.routeName}__edit`, {
                  mode: 'add'
                })
              }}
            >
              <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
                {
                  item.svgIcon ? (
                    <item.svgIcon height={40} width={40} />
                  ) : (
                    <Image
                      source={item.icon}
                      style={{ height: 40, width: 40 }}
                    />
                  )
                }
                <Text
                  tx={item.label}
                  style={{ color: color.textBlack, marginLeft: 12 }}
                />
              </View>
            </ActionSheetItem>
          ))
        }
      </ActionSheetContent>
    </ActionSheet>
  )
}