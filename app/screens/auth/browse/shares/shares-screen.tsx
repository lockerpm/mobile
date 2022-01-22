import React from "react"
import { View } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome'
import { Text, Button, Layout } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { commonStyles } from "../../../../theme"

// @ts-ignore
import BackIcon from '../../../../components/header/arrow-left.svg'
// @ts-ignore
import BackIconLight from '../../../../components/header/arrow-left-light.svg'

import { observer } from "mobx-react-lite"
import { useStores } from "../../../../models"


export const SharesScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, color, isDark } = useMixins()
  const { cipherStore } = useStores()

  const notiCount = cipherStore.sharingInvitations.length
  
  return (
    <Layout
      borderBottom
      containerStyle={{ 
        backgroundColor: isDark ? color.background : color.block, 
        paddingTop: 0 
      }}
      header={(
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Button 
            preset="link" 
            onPress={() => navigation.goBack()}
            style={{ 
              height: 35,
              width: 35,
              justifyContent: 'flex-start',
              alignItems: 'center'
            }}
          >
            {
              isDark ? (
                <BackIconLight height={12} />
              ) : (
                <BackIcon height={12} />
              )
            }
          </Button>

          <Text preset="largeHeader" text={translate('shares.shares')} />
        </View>
      )}
    >
      <View
        style={{
          backgroundColor: isDark ? color.block : color.background,
          borderRadius: 10,
          paddingHorizontal: 14,
          marginTop: 20
        }}
      >
        <Button
          preset="link"
          onPress={() => {
            navigation.navigate('sharedItems')
          }}
          style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
            borderBottomColor: color.line,
            borderBottomWidth: 1,
            paddingVertical: 18
          }]}
        >
          <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { flex: 1 }]}>
            <Text
              text={translate('shares.shared_items')}
              style={{ color: color.title, paddingHorizontal: 10 }}
            />
            {
              (notiCount > 0) && (
                <View
                  style={{
                    backgroundColor: color.error,
                    borderRadius: 20,
                    minWidth: 17,
                    height: 17
                  }}
                >
                  <Text
                    text={notiCount.toString()}
                    style={{
                      fontSize: 12,
                      textAlign: 'center',
                      color: color.white,
                      lineHeight: 17
                    }}
                  />
                </View>
              )
            }
          </View>
          <Icon name="angle-right" size={20} color={color.title} />
        </Button>

        <Button
          preset="link"
          onPress={() => {
            navigation.navigate('shareItems')
          }}
          style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
            borderBottomColor: color.line,
            paddingVertical: 18
          }]}
        >
          <Text
            text={translate('shares.share_items')}
            style={{ color: color.title, flex: 1, paddingHorizontal: 10 }}
          />
          <Icon name="angle-right" size={20} color={color.title} />
        </Button>
      </View>
    </Layout>
  )
})
