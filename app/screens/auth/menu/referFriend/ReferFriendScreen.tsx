import React, { FC } from 'react'
import { View, Share, TouchableOpacity, Image, SafeAreaView, Platform } from 'react-native'
import { Button, Icon, Text } from 'app/components/cores'
import LinearGradient from 'react-native-linear-gradient'
import { AppStackScreenProps } from 'app/navigators'
import { useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { translate } from 'app/i18n'

const IS_IOS = Platform.OS === 'ios'

export const ReferFriendScreen: FC<AppStackScreenProps<'refer_friend'>> = (props) => {
  const navigation = props.navigation
  const route = props.route
  const { colors } = useTheme()
  const { copyToClipboard } = useHelper()
  const gradientColor = IS_IOS
    ? ['#F1F2F3', '#D5EBD920', '#26833460']
    : ['#FFFFFF', '#D5EBD920', '#26833460']

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: translate('refer_friend.refer_header') + route.params.referLink,
      })
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message)
    }
  }

  // ----------------------- RENDER -----------------------
  return (
    <SafeAreaView
      style={{
        backgroundColor: colors.block,
        paddingHorizontal: 0,
        flex: 1,
      }}
    >
      <LinearGradient
        colors={gradientColor}
        style={{
          height: '40%',
          borderBottomRightRadius: 60,
          borderBottomLeftRadius: 60,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: '10%',
            zIndex: 2,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingHorizontal: 15,
            paddingTop: 15,
            width: '100%',
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon icon={'x-circle'} size={24} containerStyle={{ alignSelf: 'flex-end' }} />
          </TouchableOpacity>
        </View>
        <Image
          source={require('assets/images/intro/refer.png')}
          style={{
            marginTop: 20,
            width: 200,
            height: 200,
          }}
        />
      </LinearGradient>
      <View
        style={{
          marginHorizontal: 20,
        }}
      >
        <Text
          preset="bold"
          size="xl"
          style={{ marginTop: 32 }}
          text={translate('refer_friend.title')}
        />

        <Text style={{ marginVertical: 16 }} text={translate('refer_friend.desc')} />

        <TouchableOpacity
          onPress={() =>
            copyToClipboard(translate('refer_friend.refer_header') + route.params.referLink)
          }
          style={{
            borderColor: colors.title,
            borderRadius: 4,
            borderWidth: 0.2,
            padding: 10,
            flexDirection: 'row',
          }}
        >
          <Icon icon="link" size={18} />
          <Text
            text={route.params.referLink ? route.params.referLink : 'Placeholder..'}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      <Button
        style={{
          marginHorizontal: 20,
          marginTop: 16,
        }}
        text={translate('refer_friend.btn')}
        onPress={() => onShare()}
      />
    </SafeAreaView>
  )
}
