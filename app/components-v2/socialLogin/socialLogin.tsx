import React, { useCallback, useState } from 'react'
import { Dimensions, Modal, Platform, View, ViewStyle } from 'react-native'
import { Button, ImageIcon, Text } from '../cores'

const IS_IOS = Platform.OS === 'ios'
const SCREEN_WIDTH = Dimensions.get('screen').width

export const SocialLogin = () => {

  const [showGithubLogin, setShowGithubLogin] = useState(false)

  const SOCIAL_LOGIN: {
    [service: string]: {
      hide?: boolean
      icon: 'apple' | 'google' | 'facebook' | 'github' | 'sso'
      handler: () => void
    }
  } = {
    apple: {
      hide: !IS_IOS,
      icon: 'apple',
      handler: () => {
//
      },
    },

    google: {
      icon: 'google',
      handler: () => {
//
      },
    },

    facebook: {
      icon: 'facebook',
      handler: () => {
//
      },
    },

    github: {
      icon: 'github',
      handler: () => {
//
      },
    },
    sso: {
      icon: 'sso',
      handler: () => {
        setShowGithubLogin(true)
      },
    },
  }

  const SocialLoginFlexLayout = useCallback(() => {
    if (Platform.OS === 'android' || SCREEN_WIDTH > 320) {
      return (
        <View style={$centerRowSpaceBtw}>
          {Object.values(SOCIAL_LOGIN)
            .filter((item) => !item.hide)
            .map((item, index) => (
              <ImageIcon
                style={{ marginHorizontal: 16 }}
                key={index}
                icon={item.icon}
                size={40}
                onPress={item.handler}
              />
            ))}
        </View>
      )
    }
    return (
      <View>
        <View style={$centerRowSpaceBtw}>
          {Object.values(SOCIAL_LOGIN)
            .slice(0, 3)
            .map((item, index) => (
              <ImageIcon
                style={{ marginHorizontal: 20 }}
                key={index}
                icon={item.icon}
                size={40}
                onPress={item.handler}
              />
            ))}
        </View>
        <View style={[$centerRowSpaceBtw, { marginVertical: 20 }]}>
          {Object.values(SOCIAL_LOGIN)
            .slice(3)
            .map((item, index) => (
              <ImageIcon
                style={{ marginHorizontal: 20 }}
                key={index}
                icon={item.icon}
                size={40}
                onPress={item.handler}
              />
            ))}
        </View>
      </View>

    )
  }, [])
  return (
    <View>
      <Modal transparent animationType="fade" visible={showGithubLogin}>
        <View style={{
          flex: 1,
          backgroundColor: 'red',
          justifyContent: "center"
        }}>
          <Button text='asd' onPress={() => {
            setShowGithubLogin(false)
          }} />
        </View>
      </Modal>

      <Text text='Or login with' style={{ textAlign: 'center', marginVertical: 16 }} />

      <SocialLoginFlexLayout />
    </View>

  )
}

const $centerRowSpaceBtw: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center'
}