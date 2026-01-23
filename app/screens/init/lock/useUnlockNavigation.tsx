import { useNavigation } from "@react-navigation/native"

import { CipherType } from "core/enums"

import { useStores } from "@/models"
import { AppScreenProps } from "@/navigators"
import { AndroidASType, androidAutofillServiceData } from "@/utils/autofill.android"

export const useUnlockNavigation = () => {
  const { uiStore } = useStores()

  const navigation = useNavigation<AppScreenProps<"lock">["navigation"]>()

  const navigateToIntroIfNeeded = () => {
    uiStore.setStartFromPasswordLess(false)

    navigation.replace("authStack", {
      screen: "homeStack",
      params: {
        screen: "biometricUnlockIntro",
      },
    })
  }

  const navigateToAndroidAutofillSetupIfNeeded = () => {
    const data = androidAutofillServiceData
    if (!data) {
      return
    }
    if (data.type === AndroidASType.SAVE_PASSWORD) {
      navigation.replace("authStack", {
        screen: "browseStack",
        params: {
          screen: "cipherEdit",
          params: {
            cipherType: CipherType.Login,
            mode: "add",
            initialUrl: data.url,
            androidAutofillSavedData: data,
          },
        },
      })
    } else if (data.type === AndroidASType.CREATE_PASSKEY) {
      navigation.replace("authStack", {
        screen: "androidAutofillStack",
        params: {
          screen: "createPasskey",
          params: {
            data,
          },
        },
      })
    } else if (data.type === AndroidASType.GET_PASSKEY) {
      navigation.replace("authStack", {
        screen: "androidAutofillStack",
        params: {
          screen: "passkeyList",
          params: {
            data,
          },
        },
      })
    } else {
      navigation.replace("authStack", {
        screen: "androidAutofillStack",
        params: {
          screen: "passwordList",
          params: {
            data,
          },
        },
      })
    }
    return
  }

  const navigateToAuthenticatorSetupIfNeeded = (otpauthLabel: string) => {
    // open the authenticator screen for copying code
    if (otpauthLabel === "otpauth://") {
      navigation.replace("authStack", {
        screen: "mainTab",
        params: {
          screen: "authenticatorTab",
        },
      })
    } else {
      // open the authenticator screen for adding new TOTP
      navigation.replace("authStack", {
        screen: "browseStack",
        params: {
          screen: "cipherEdit",
          params: {
            mode: "add",
            cipherType: CipherType.TOTP,
            otpUri: otpauthLabel,
          },
        },
      })
    }
  }
  return {
    navigateToIntroIfNeeded,
    navigateToAndroidAutofillSetupIfNeeded,
    navigateToAuthenticatorSetupIfNeeded,
  }
}
