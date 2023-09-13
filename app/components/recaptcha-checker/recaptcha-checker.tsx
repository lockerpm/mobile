import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import Recaptcha from 'react-native-recaptcha-that-works'
import { RECAPTCHA_BASE_URL, RECAPTCHA_SITE_KEY } from '../../config/constants'
import { useMixins } from '../../services/mixins'
import { Logger } from '../../utils/utils'

type Props = {
}

export const RecaptchaChecker = forwardRef((props: Props, ref) => {
  const { notify } = useMixins()

  let token = ''
  const recaptcha = useRef(null)

  const waitForToken = () => {
    return new Promise<string>((resolve) => {
      token = ''
      recaptcha.current.open()
      const interval = setInterval(() => {
        if (token) {
          resolve(token)
          clearInterval(interval)
        }
      }, 500)
    })
  }

  const onVerify = (t: string) => {
    Logger.debug('Captcha loaded')
    token = t
  }

  const onExpire = () => {
    notify('error', 'Captcha expired, please close the app and open again.')
  }

  const onError = (e: string) => {
    Logger.error(`RECAPTCHA ERROR: ${e}`)
  }

  useImperativeHandle(ref, () => ({
    waitForToken,
    token
  }))

  return (
    <Recaptcha
      ref={recaptcha}
      siteKey={RECAPTCHA_SITE_KEY}
      baseUrl={RECAPTCHA_BASE_URL}
      onVerify={onVerify}
      onExpire={onExpire}
      onError={onError}
      size="invisible"
    />
  )
})
