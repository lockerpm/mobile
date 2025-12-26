import { useState } from "react"
import { ImageStyle } from "react-native"

import { ImageIcon } from "@/components/cores"
import Config from "@/config"
import { useHelper, useSocialLogin } from "@/services/hook"
import { getUrlParameterByName } from "@/utils/utils"

import { WebViewModal } from "./WebviewModal"

const redirectUri = "https://id.locker.io/callback"

const scopes = ["openid", "https://graph.microsoft.com/user.read"]

type Props = {
  setIsLoading: (val: boolean) => void
  onLoggedIn: (newUser: boolean, token: string) => void
}

export const MicrosoftLogin = (props: Props) => {
  const [isOpenWebView, setIsOpenWebView] = useState(false)
  const { handleSocialLogin } = useSocialLogin(props)

  return (
    <>
      <MicrosoftLoginModal
        isOpen={isOpenWebView}
        onClose={() => setIsOpenWebView(false)}
        onDone={(code) => {
          handleSocialLogin({
            provider: "microsoft",
            code,
            redirectUri: redirectUri,
          })
        }}
      />
      <ImageIcon
        style={$mh16}
        icon={"microsoft"}
        size={32}
        onPress={() => {
          setIsOpenWebView(true)
        }}
      />
    </>
  )
}

type GitHubLoginModalProps = {
  isOpen: boolean
  onClose: () => void
  onDone: (code: string) => void
}

export const MicrosoftLoginModal = (props: GitHubLoginModalProps) => {
  const { isOpen, onClose, onDone } = props
  const { randomString } = useHelper()

  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${Config.MICROSOFT_CONFIG_CLIENTID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(" "))}&state=${randomString()}&response_type=code`

  const onURLChange = (url: string) => {
    if (url.startsWith(redirectUri)) {
      const code = getUrlParameterByName("code", url)
      if (code) {
        onClose()
        onDone(code)
      }
    }
  }

  return <WebViewModal url={url} isOpen={isOpen} onClose={onClose} onURLChange={onURLChange} />
}

const $mh16: ImageStyle = {
  marginHorizontal: 12,
}
