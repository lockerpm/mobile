import React, { useRef, useEffect } from 'react'
import Recaptcha from 'react-native-recaptcha-that-works'
import { RECAPTCHA_BASE_URL, RECAPTCHA_SITE_KEY } from '../../config/constants'
import { Logger } from '../../utils/logger'


type Props = {
  onTokenLoad: (token: string) => void
}

export const RecaptchaChecker = (props: Props) => {
  const { onTokenLoad } = props

  const recaptcha = useRef(null)

  const send = () => {
    recaptcha.current.open()
  }

  const onVerify = (token: string) => {
    Logger.debug('Captcha loaded')
    onTokenLoad(token)
  }

  const onExpire = () => {
    send()
  }

  useEffect(() => {
    send()
  }, [])

  return (
    <Recaptcha
      ref={recaptcha}
      siteKey={RECAPTCHA_SITE_KEY}
      baseUrl={RECAPTCHA_BASE_URL}
      onVerify={onVerify}
      onExpire={onExpire}
      size="invisible"
    />
  )
}
