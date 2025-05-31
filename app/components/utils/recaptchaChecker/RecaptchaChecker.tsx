import React, { useRef, forwardRef, useImperativeHandle } from "react"
import Recaptcha, { RecaptchaRef } from "react-native-recaptcha-that-works"
import { Logger } from "app/utils/utils"
import { RECAPTCHA_BASE_URL, RECAPTCHA_SITE_KEY } from "app/config/constants"
import { useToast } from "app/services/utils"

// Define the type for the ref
export type RecaptchaCheckerRef = {
  waitForToken: () => Promise<string>
  token: React.MutableRefObject<string>
}

type RecaptchaCheckerProps = {
  //
}

export const RecaptchaChecker = forwardRef<RecaptchaCheckerRef, RecaptchaCheckerProps>(
  (_props, ref) => {
    const { notify } = useToast()

    const token = useRef("")
    const recaptcha = useRef<RecaptchaRef>(null)

    const waitForToken = () => {
      return new Promise<string>((resolve) => {
        token.current = ""
        recaptcha.current?.open()
        const interval = setInterval(() => {
          if (token.current) {
            resolve(token.current)
            clearInterval(interval)
          }
        }, 500)
      })
    }

    const onVerify = (t: string) => {
      Logger.debug("Captcha loaded")
      token.current = t
    }

    const onExpire = () => {
      notify("error", "Captcha expired, please close the app and open again.")
    }

    const onError = (e: string) => {
      Logger.error(`RECAPTCHA ERROR: ${e}`)
    }

    useImperativeHandle(ref, () => ({
      waitForToken,
      token,
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
  },
)
