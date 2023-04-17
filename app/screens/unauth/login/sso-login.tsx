import React, { useEffect } from "react"
import { Linking } from "react-native"
import { WebViewModal } from "../../../components"
import { GITHUB_CONFIG } from "../../../config/constants"
import { getUrlParameterByName } from "../../../utils/helpers"

type Props = {
  isOpen: boolean
  onClose: () => void
  onDone: (code: string) => void
}

export const SsoLoginModal = (props: Props) => {
  const { isOpen, onClose, onDone } = props

  const url = `https://vincss-sso.fido2.vn/oauth2/authorize?response_type=code&client_id=UBoJuF8LDZTH4QgndGHdcwx04e48BjaZ&redirect_uri=https://id-staging.locker.io/callback`

  const onURLChange = (url: string) => {
    if (url.startsWith(GITHUB_CONFIG.redirectUrl)) {
      const code = getUrlParameterByName("code", url)
      // onClose()
      console.log(code)
      // onDone(code)
    }
  }
  const openUrl = () => {
    Linking.openURL(url)
  }
  useEffect(() => {
    if (isOpen) {
      openUrl()
    }
  }, [isOpen])

  return <WebViewModal url={url} isOpen={isOpen} onClose={onClose} onURLChange={onURLChange} />
}
