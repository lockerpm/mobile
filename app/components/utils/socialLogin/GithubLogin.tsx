import { useEffect } from "react"
import { ImageStyle } from "react-native"
import { makeRedirectUri, useAuthRequest } from "expo-auth-session"

import { ImageIcon } from "@/components/cores"
import Config from "@/config"
import { useSocialLogin } from "@/services/hook"

const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
}

type Props = {
  setIsLoading: (val: boolean) => void
  onLoggedIn: (newUser: boolean, token: string) => void
}

export const GithubLogin = (props: Props) => {
  const { handleSocialLogin } = useSocialLogin(props)

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: Config.GITHUB_CONFIG_CLIENTID,
      scopes: ["user:email"],
      redirectUri: makeRedirectUri({
        scheme: "com.cystack.locker",
        path: "oauthredirect",
      }),
      usePKCE: false,
    },
    discovery
  )

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params
      handleSocialLogin({
        provider: "github",
        code,
      })
    }
  }, [response])

  return (
    <ImageIcon
      disabled={!request}
      style={$mh16}
      icon={"github"}
      size={32}
      onPress={() => {
        promptAsync()
      }}
    />
  )
}

const $mh16: ImageStyle = {
  marginHorizontal: 12,
}
