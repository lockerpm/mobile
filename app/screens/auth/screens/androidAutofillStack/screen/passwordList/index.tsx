import { FC, useCallback, useEffect, useState } from "react"
import { BackHandler, NativeModules, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"

import { Screen } from "app/components/cores"
import { useCipherData } from "app/services/hook"
import { getTOTP, parseOTPUri } from "app/utils/totp"
import { CipherType } from "core/enums"
import { CipherView } from "core/models/view"

import { MotionLoading } from "@/components/utils"
import { AndroidAutofillScreenProps } from "@/navigators"
import { useClipboard, useToast } from "@/services/utils"
import { CipherAppView } from "@/static/types"
import { AndroidASType } from "@/utils/autofill.android"

import { AutoFillList } from "./AutofillList"
import { ListHeader } from "./ListHeader"

const { RNAutofillServiceAndroid } = NativeModules

export const AndroidAutofillScreen: FC<AndroidAutofillScreenProps<"passwordList">> = observer(
  ({
    navigation,
    route: {
      params: { data },
    },
  }) => {
    const { getCiphersFromCache } = useCipherData()
    const { copyToClipboard } = useClipboard()
    const { notifyTx } = useToast()

    const initUrl = "url" in data ? data.url : ""
    const isLastFillItem = data.type === AndroidASType.QUICK_BAR_PASSWORD && data.id
    const [showListPassword, setShowListPassword] = useState(!isLastFillItem)

    // -------------------- Methods ----------------------------
    const navigateToAddCipher = useCallback(() => {
      navigation.navigate("browseStack", {
        screen: "cipherEdit",
        params: {
          mode: "add",
          initialUrl: initUrl,
          cipherType: CipherType.Login,
        },
      })
    }, [initUrl, navigation])

    const navigateToCipherActions = useCallback(
      (item: CipherAppView) => {
        navigation.navigate("passwordActionsModal", {
          item,
        })
      },
      [navigation]
    )

    const navigateToGeneratePassword = useCallback(() => {
      navigation.navigate("passwordGenModal")
    }, [navigation])

    const handleAutofillLastItem = useCallback(async () => {
      if (isLastFillItem) {
        const allLogins = await getCiphersFromCache({
          deleted: false,
          searchText: "",
          filters: [(c: CipherView) => c.id === data.id],
        })

        if (allLogins.length > 0) {
          RNAutofillServiceAndroid.useLastItem()
          if (allLogins[0].login.hasTotp) {
            getTOTP(parseOTPUri(allLogins[0].login.totp)).then((otp) => {
              copyToClipboard(otp)
            })
          }
        } else {
          setShowListPassword(true)
          RNAutofillServiceAndroid.removeLastItem()
          notifyTx("info", "autofill_service:deleted")
        }
      }
    }, [data])

    // -------------------- EFFECT ----------------------------
    // Suggest save
    useEffect(() => {
      handleAutofillLastItem()
    }, [handleAutofillLastItem])

    // -------------------- RENDER ----------------------------

    return (
      <Screen
        safeAreaEdges={["top"]}
        header={
          <ListHeader
            headerTx="common:passwords"
            goBack={BackHandler.exitApp}
            openAdd={navigateToAddCipher}
            openPasswordGenerator={navigateToGeneratePassword}
          />
        }
        contentContainerStyle={$container}
      >
        {showListPassword && (
          <AutoFillList
            domain={initUrl}
            openActionMenu={navigateToCipherActions}
            navigateToAddCipher={navigateToAddCipher}
          />
        )}
        {!showListPassword && <MotionLoading disableProgress />}
      </Screen>
    )
  }
)

const $container: ViewStyle = {
  flex: 1,
}
