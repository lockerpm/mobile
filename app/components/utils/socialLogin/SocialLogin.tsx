import React, { useCallback, useState } from 'react'
import { Dimensions, Platform, View, ViewStyle } from 'react-native'
import { ImageIcon, Text } from '../../cores'
import { useHelper, useSocialLogin } from 'app/services/hook'
import { GITHUB_CONFIG } from 'app/config/constants'
import { getUrlParameterByName } from 'app/utils/utils'
import { WebViewModal } from '../../webviewModal/WebviewModal'
import { useNavigation } from '@react-navigation/native'

const IS_IOS = Platform.OS === 'ios'
const SCREEN_WIDTH = Dimensions.get('screen').width

interface Props {
  /**
   * Callback when social authen success
   */
  onLoggedIn: (_newUser: boolean, _token: string) => Promise<void>
}

export const SocialLogin = ({ onLoggedIn }: Props) => {
  const navigation = useNavigation() as any
  const [showGitHubLogin, setShowGitHubLogin] = useState(false)
  const { translate } = useHelper()
  const { googleLogin, facebookLogin, githubLogin, appleLogin } = useSocialLogin()

  const SOCIAL_LOGIN: {
    [service: string]: {
      hide?: boolean
      icon: 'apple' | 'google' | 'facebook' | 'github' | 'sso'
      handler: () => void
    }
  } = {
    facebook: {
      icon: 'facebook',
      handler: () => {
        return facebookLogin({
          onLoggedIn,
        })
      },
    },
    google: {
      icon: 'google',
      handler: () => {
        return googleLogin({
          onLoggedIn,
        })
      },
    },
    apple: {
      hide: !IS_IOS,
      icon: 'apple',
      handler: () => {
        return appleLogin({
          onLoggedIn,
        })
      },
    },

    github: {
      icon: 'github',
      handler: () => {
        setShowGitHubLogin(true)
      },
    },
    sso: {
      icon: 'sso',
      handler: () => {
        navigation.navigate('ssoIdentifier')
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
      <GitHubLoginModal
        isOpen={showGitHubLogin}
        onClose={() => setShowGitHubLogin(false)}
        onDone={(code) => {
          githubLogin({
            onLoggedIn,
            code,
          })
        }}
      />

      <Text
        text={translate('common.social_login')}
        style={{ textAlign: 'center', marginVertical: 16 }}
      />

      <SocialLoginFlexLayout />
    </View>
  )
}

type GitHubLoginModalProps = {
  isOpen: boolean
  onClose: () => void
  onDone: (code: string) => void
}

export const GitHubLoginModal = (props: GitHubLoginModalProps) => {
  const { isOpen, onClose, onDone } = props
  const { randomString } = useHelper()

  const url = `${GITHUB_CONFIG.authorizationEndpoint}?client_id=${
    GITHUB_CONFIG.clientId
  }&redirect_uri=${encodeURIComponent(GITHUB_CONFIG.redirectUrl)}&scope=${encodeURIComponent(
    GITHUB_CONFIG.scopes.join(' ')
  )}&state=${randomString()}`

  const onURLChange = (url: string) => {
    if (url.startsWith(GITHUB_CONFIG.redirectUrl)) {
      const code = getUrlParameterByName('code', url)
      onClose()
      onDone(code)
    }
  }

  return <WebViewModal url={url} isOpen={isOpen} onClose={onClose} onURLChange={onURLChange} />
}

const $centerRowSpaceBtw: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
}
